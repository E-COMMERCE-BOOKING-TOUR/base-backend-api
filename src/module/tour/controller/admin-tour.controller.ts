import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    Put,
    Query,
    Res,
    UploadedFile,
    UseInterceptors,
    UseGuards,
    Req,
} from '@nestjs/common';
import type { Response } from 'express';
import { User } from '@/module/user/decorator/user.decorator';
import { UserEntity } from '@/module/user/entity/user.entity';
import {
    ApiBearerAuth,
    ApiBody,
    ApiOperation,
    ApiParam,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { AdminTourService } from '../service/admin-tour.service';
import { CloudinaryService } from '../../cloudinary/cloudinary.service';
import { PriceCacheService } from '../service/price-cache.service';
import {
    AdminTourQueryDTO,
    PaginatedTourResponse,
    TourDTO,
    TourPolicyDTO,
} from '../dto/tour.dto';
import { TourEntity } from '../entity/tour.entity';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '@/module/user/guard/roles.guard';
import { PermissionsGuard } from '@/module/user/guard/permissions.guard';
import { Permissions } from '@/module/user/decorator/permissions.decorator';
import { Roles } from '@/module/user/decorator/roles.decorator';

@ApiTags('Admin Tour')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard, PermissionsGuard)
@Controller('admin/tour')
export class AdminTourController {
    constructor(
        private readonly adminTourService: AdminTourService,
        private readonly cloudinaryService: CloudinaryService,
        private readonly priceCacheService: PriceCacheService,
    ) { }

    @Post('refresh-price-cache')
    @Permissions('tour:update')
    @ApiOperation({ summary: 'Manually refresh price cache for all tours' })
    @ApiResponse({
        status: 200,
        description: 'Price cache refresh result',
        schema: {
            properties: {
                message: { type: 'string' },
            },
        },
    })
    async refreshPriceCache() {
        return this.priceCacheService.updateAllTourPriceCache();
    }

    @Post('refresh-price-cache/:id')
    @Permissions('tour:update')
    @ApiOperation({ summary: 'Refresh price cache for a specific tour' })
    @ApiParam({ name: 'id', type: Number })
    @ApiResponse({ status: 200, description: 'Price cache updated' })
    async refreshTourPriceCache(@Param('id') id: number) {
        await this.priceCacheService.updateTourPriceCache(id);
        return { success: true, message: `Price cache updated for tour ${id}` };
    }

    @Post('upload')
    @Permissions('tour:create', 'tour:update')
    @UseInterceptors(FileInterceptor('file'))
    async uploadImage(@UploadedFile() file: Express.Multer.File) {
        return this.cloudinaryService.uploadFile(file);
    }

    @Get('csv-template')
    @Permissions('tour:create')
    @ApiOperation({ summary: 'Download CSV template for tour import' })
    @ApiResponse({ status: 200, description: 'CSV template file' })
    async getCsvTemplate(@Res() res: Response) {
        const csvContent = this.adminTourService.generateCsvTemplate();
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="tour_import_template.csv"');
        return res.send(csvContent);
    }

    @Post('import-csv')
    @Permissions('tour:create')
    @UseInterceptors(FileInterceptor('file'))
    @ApiOperation({ summary: 'Import tours from CSV file' })
    @ApiResponse({ status: 201, description: 'Import results with success count and errors' })
    async importCsv(
        @UploadedFile() file: Express.Multer.File,
        @User() user: UserEntity,
    ) {
        if (!file) {
            return { success: 0, errors: [{ row: 0, reason: 'No file uploaded' }] };
        }

        const content = file.buffer.toString('utf-8');
        const rows = this.parseCsv(content);

        return this.adminTourService.importFromCsv(rows, user);
    }

    private parseCsv(content: string): Record<string, string>[] {
        const lines = content.split('\n').map(line => line.trim()).filter(line => line.length > 0);
        if (lines.length < 2) return [];

        const headers = this.parseCsvLine(lines[0]);
        const rows: Record<string, string>[] = [];

        for (let i = 1; i < lines.length; i++) {
            const values = this.parseCsvLine(lines[i]);
            const row: Record<string, string> = {};
            headers.forEach((header, idx) => {
                row[header] = values[idx] || '';
            });
            rows.push(row);
        }

        return rows;
    }

    private parseCsvLine(line: string): string[] {
        const result: string[] = [];
        let current = '';
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            const nextChar = line[i + 1];

            if (inQuotes) {
                if (char === '"' && nextChar === '"') {
                    current += '"';
                    i++;
                } else if (char === '"') {
                    inQuotes = false;
                } else {
                    current += char;
                }
            } else {
                if (char === '"') {
                    inQuotes = true;
                } else if (char === ',') {
                    result.push(current);
                    current = '';
                } else {
                    current += char;
                }
            }
        }
        result.push(current);
        return result;
    }

    @Get('getAll')
    @Permissions('tour:read')
    @ApiResponse({ status: 200, type: PaginatedTourResponse })
    async getAllTours(
        @Query() query: AdminTourQueryDTO,
        @User() user: UserEntity,
    ) {
        return this.adminTourService.getAllTours(query, user);
    }

    @Get('metadata/countries')
    @Permissions('tour:read')
    async getCountries() {
        return this.adminTourService.getCountries();
    }

    @Get('metadata/divisions/:countryId')
    @Permissions('tour:read')
    async getDivisionsByCountry(@Param('countryId') countryId: number) {
        return this.adminTourService.getDivisionsByCountry(countryId);
    }

    @Get('metadata/currencies')
    @Permissions('tour:read')
    async getCurrencies() {
        return this.adminTourService.getCurrencies();
    }

    @Get('policies/:supplierId')
    @Permissions('tour:read')
    @ApiParam({ name: 'supplierId', type: Number })
    async getPoliciesBySupplier(
        @Param('supplierId') supplierId: number,
        @User() user: UserEntity,
    ) {
        let finalSupplierId = supplierId;
        if (user?.supplier) {
            finalSupplierId = user.supplier.id;
        }
        return this.adminTourService.getPoliciesBySupplier(finalSupplierId);
    }

    @Get('getById/:id')
    @Permissions('tour:read')
    @ApiParam({ name: 'id', type: Number })
    @ApiResponse({ status: 200, type: TourEntity })
    async getTourById(@Param('id') id: number, @User() user: UserEntity) {
        return this.adminTourService.getTourById(id, user);
    }

    @Get('visibility-check/:id')
    @Permissions('tour:read')
    @ApiParam({ name: 'id', type: Number })
    @ApiOperation({ summary: 'Check why a tour is visible or hidden' })
    async getVisibilityReport(@Param('id') id: number, @User() user: UserEntity) {
        return this.adminTourService.getVisibilityReport(id, user);
    }

    @Post('create')
    @Permissions('tour:create')
    @ApiBody({ type: TourDTO })
    @ApiResponse({ status: 201, type: TourEntity })
    async createTour(@Body() dto: TourDTO, @User() user: UserEntity) {
        return this.adminTourService.createTour(dto, user);
    }

    @Put('update/:id')
    @Permissions('tour:update')
    @ApiParam({ name: 'id', type: Number })
    @ApiBody({ type: TourDTO })
    @ApiResponse({ status: 200, type: TourEntity })
    async updateTour(
        @Param('id') id: number,
        @Body() dto: Partial<TourDTO>,
        @User() user: UserEntity,
    ) {
        return this.adminTourService.updateTour(id, dto, user);
    }

    @Patch('status/:id')
    @Permissions('tour:publish')
    @ApiParam({ name: 'id', type: Number })
    @ApiBody({
        schema: { type: 'object', properties: { status: { type: 'string' } } },
    })
    async updateStatus(
        @Param('id') id: number,
        @Body('status') status: string,
        @User() user: UserEntity,
    ) {
        return this.adminTourService.updateStatus(id, status, user);
    }

    @Delete('remove/:id')
    @Permissions('tour:delete')
    @ApiParam({ name: 'id', type: Number })
    async removeTour(@Param('id') id: number, @User() user: UserEntity) {
        return this.adminTourService.removeTour(id, user);
    }

    // --- Policy Management ---

    @Post('policy')
    @Permissions('tour:update')
    @ApiBody({ type: TourPolicyDTO })
    async createPolicy(@Body() dto: TourPolicyDTO, @User() user: UserEntity) {
        return this.adminTourService.createPolicy(dto, user);
    }

    @Put('policy/:id')
    @Permissions('tour:update')
    @ApiParam({ name: 'id', type: Number })
    @ApiBody({ type: TourPolicyDTO })
    async updatePolicy(
        @Param('id') id: number,
        @Body() dto: Partial<TourPolicyDTO>,
        @User() user: UserEntity,
    ) {
        return this.adminTourService.updatePolicy(id, dto, user);
    }

    @Delete('policy/:id')
    @Permissions('tour:update')
    @ApiParam({ name: 'id', type: Number })
    async removePolicy(@Param('id') id: number, @User() user: UserEntity) {
        return this.adminTourService.removePolicy(id, user);
    }

    @Post('generate-vectors')
    @Permissions('tour:update')
    @ApiOperation({ summary: 'Generate AI vectors for all tours' })
    async generateVectors() {
        return this.adminTourService.generateVectorsForAllTours();
    }
}
