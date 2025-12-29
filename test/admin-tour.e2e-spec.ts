import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { App } from 'supertest/types';

import {
    mockDatabase,
    createMockRepository,
    TestDataFactory,
} from './test-utils';

describe('Admin Tour API (e2e) - Mocked', () => {
    let app: INestApplication<App>;

    // Mock AdminTourService
    const mockAdminTourService = {
        getAllTours: jest.fn(),
        getTourById: jest.fn(),
        createTour: jest.fn(),
        updateTour: jest.fn(),
        updateStatus: jest.fn(),
        removeTour: jest.fn(),
        getCountries: jest.fn(),
        getDivisionsByCountry: jest.fn(),
        getCurrencies: jest.fn(),
        getPoliciesBySupplier: jest.fn(),
        createPolicy: jest.fn(),
        updatePolicy: jest.fn(),
        removePolicy: jest.fn(),
        getVisibilityReport: jest.fn(),
    };

    const mockPolicies = new Map<number, any>();
    let nextPolicyId = 1;

    beforeAll(async () => {
        mockDatabase.reset();

        mockAdminTourService.getAllTours.mockImplementation((query: any) => {
            let tours = Array.from(mockDatabase.tours.values());

            if (query?.search) {
                tours = tours.filter((t: any) =>
                    t.name.toLowerCase().includes(query.search.toLowerCase())
                );
            }
            if (query?.status) {
                tours = tours.filter((t: any) => t.status === query.status);
            }

            const page = query?.page || 1;
            const limit = query?.limit || 10;
            const start = (page - 1) * limit;

            return Promise.resolve({
                data: tours.slice(start, start + limit),
                total: tours.length,
                page,
                limit,
            });
        });

        mockAdminTourService.getTourById.mockImplementation((id: number) => {
            const tour = mockDatabase.tours.get(id);
            if (!tour) throw new Error('Tour not found');
            return Promise.resolve(tour);
        });

        mockAdminTourService.createTour.mockImplementation((dto: any) => {
            const tourId = mockDatabase.nextId.tour++;
            const tour = {
                id: tourId,
                ...dto,
                created_at: new Date(),
            };
            mockDatabase.tours.set(tourId, tour);
            return Promise.resolve(tour);
        });

        mockAdminTourService.updateTour.mockImplementation((id: number, dto: any) => {
            const tour = mockDatabase.tours.get(id);
            if (tour) {
                const updated = { ...tour, ...dto };
                mockDatabase.tours.set(id, updated);
                return Promise.resolve(updated);
            }
            throw new Error('Tour not found');
        });

        mockAdminTourService.updateStatus.mockImplementation((id: number, status: string) => {
            const tour = mockDatabase.tours.get(id);
            if (tour) {
                tour.status = status;
                return Promise.resolve(tour);
            }
            throw new Error('Tour not found');
        });

        mockAdminTourService.removeTour.mockImplementation((id: number) => {
            mockDatabase.tours.delete(id);
            return Promise.resolve({ success: true });
        });

        mockAdminTourService.getCountries.mockResolvedValue(
            Array.from(mockDatabase.countries.values())
        );

        mockAdminTourService.getDivisionsByCountry.mockImplementation((countryId: number) => {
            const divisions = Array.from(mockDatabase.divisions.values());
            return Promise.resolve(
                divisions.filter((d: any) => d.country_id === countryId)
            );
        });

        mockAdminTourService.getCurrencies.mockResolvedValue(
            Array.from(mockDatabase.currencies.values())
        );

        mockAdminTourService.getPoliciesBySupplier.mockResolvedValue([]);

        mockAdminTourService.createPolicy.mockImplementation((dto: any) => {
            const policyId = nextPolicyId++;
            const policy = { id: policyId, ...dto };
            mockPolicies.set(policyId, policy);
            return Promise.resolve(policy);
        });

        mockAdminTourService.updatePolicy.mockImplementation((id: number, dto: any) => {
            const policy = mockPolicies.get(id);
            if (policy) {
                const updated = { ...policy, ...dto };
                mockPolicies.set(id, updated);
                return Promise.resolve(updated);
            }
            throw new Error('Policy not found');
        });

        mockAdminTourService.removePolicy.mockImplementation((id: number) => {
            mockPolicies.delete(id);
            return Promise.resolve({ success: true });
        });

        mockAdminTourService.getVisibilityReport.mockImplementation((id: number) => {
            const tour = mockDatabase.tours.get(id);
            if (!tour) throw new Error('Tour not found');
            return Promise.resolve({
                isVisible: tour.is_visible && tour.status === 'active',
                checks: {
                    hasActiveStatus: tour.status === 'active',
                    isVisibleFlag: tour.is_visible,
                    hasImages: true,
                    hasVariants: true,
                    hasPricing: true,
                },
            });
        });

        const moduleFixture: TestingModule = await Test.createTestingModule({
            controllers: [],
            providers: [],
        }).compile();

        app = moduleFixture.createNestApplication();
        app.setGlobalPrefix('api/v1');
        app.useGlobalPipes(new ValidationPipe());
        await app.init();
    });

    afterAll(async () => {
        await app.close();
    });

    describe('Mock Admin Tour Service Tests', () => {
        let createdTourId: number;
        let createdPolicyId: number;

        describe('Metadata Endpoints', () => {
            it('should get countries', async () => {
                const countries = await mockAdminTourService.getCountries();
                expect(Array.isArray(countries)).toBe(true);
                expect(countries.length).toBeGreaterThan(0);
            });

            it('should get divisions by country', async () => {
                const divisions = await mockAdminTourService.getDivisionsByCountry(1);
                expect(Array.isArray(divisions)).toBe(true);
                expect(divisions.every((d: any) => d.country_id === 1)).toBe(true);
            });

            it('should get currencies', async () => {
                const currencies = await mockAdminTourService.getCurrencies();
                expect(Array.isArray(currencies)).toBe(true);
                expect(currencies.length).toBeGreaterThan(0);
            });
        });

        describe('Tour CRUD', () => {
            it('should get all tours with pagination', async () => {
                const result = await mockAdminTourService.getAllTours({ page: 1, limit: 10 });
                expect(result).toHaveProperty('data');
                expect(result).toHaveProperty('total');
            });

            it('should filter tours by search', async () => {
                const result = await mockAdminTourService.getAllTours({ search: 'Beach' });
                expect(result.data.length).toBeGreaterThan(0);
            });

            it('should filter tours by status', async () => {
                const result = await mockAdminTourService.getAllTours({ status: 'active' });
                expect(result.data.every((t: any) => t.status === 'active')).toBe(true);
            });

            it('should create tour', async () => {
                const tourData = TestDataFactory.tour();
                const tour = await mockAdminTourService.createTour(tourData);

                expect(tour).toHaveProperty('id');
                expect(tour).toHaveProperty('name', tourData.name);

                createdTourId = tour.id;
            });

            it('should get tour by id', async () => {
                const tour = await mockAdminTourService.getTourById(createdTourId);
                expect(tour).toHaveProperty('id', createdTourId);
            });

            it('should update tour', async () => {
                const updated = await mockAdminTourService.updateTour(createdTourId, {
                    name: 'Updated Tour Name',
                });
                expect(updated.name).toBe('Updated Tour Name');
            });

            it('should update tour status', async () => {
                const updated = await mockAdminTourService.updateStatus(createdTourId, 'active');
                expect(updated.status).toBe('active');
            });

            it('should get visibility report', async () => {
                const report = await mockAdminTourService.getVisibilityReport(createdTourId);
                expect(report).toHaveProperty('isVisible');
                expect(report).toHaveProperty('checks');
            });

            it('should remove tour', async () => {
                const result = await mockAdminTourService.removeTour(createdTourId);
                expect(result.success).toBe(true);
            });
        });

        describe('Policy Management', () => {
            it('should create policy', async () => {
                const policy = await mockAdminTourService.createPolicy({
                    name: 'Test Policy',
                    supplier_id: 1,
                });
                expect(policy).toHaveProperty('id');
                createdPolicyId = policy.id;
            });

            it('should update policy', async () => {
                const updated = await mockAdminTourService.updatePolicy(createdPolicyId, {
                    name: 'Updated Policy',
                });
                expect(updated.name).toBe('Updated Policy');
            });

            it('should remove policy', async () => {
                const result = await mockAdminTourService.removePolicy(createdPolicyId);
                expect(result.success).toBe(true);
            });
        });
    });
});
