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
    UploadedFile,
    UseInterceptors,
    UseGuards,
} from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiBody,
    ApiParam,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { AdminTourService } from '../service/admin-tour.service';
import { CloudinaryService } from '../../cloudinary/cloudinary.service';
import {
    AdminTourQueryDTO,
    PaginatedTourResponse,
    TourDTO,
} from '../dto/tour.dto';
import { TourEntity } from '../entity/tour.entity';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '@/module/user/guard/roles.guard';
import { Roles } from '@/module/user/decorator/roles.decorator';

@ApiTags('Admin Tour')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('admin')
@Controller('admin/tour')
export class AdminTourController {
    constructor(
        private readonly adminTourService: AdminTourService,
        private readonly cloudinaryService: CloudinaryService,
    ) {}

    @Post('upload')
    @UseInterceptors(FileInterceptor('file'))
    async uploadImage(@UploadedFile() file: Express.Multer.File) {
        return this.cloudinaryService.uploadFile(file);
    }

    @Get('getAll')
    @ApiResponse({ status: 200, type: PaginatedTourResponse })
    async getAllTours(@Query() query: AdminTourQueryDTO) {
        return this.adminTourService.getAllTours(query);
    }

    @Get('metadata/countries')
    async getCountries() {
        return this.adminTourService.getCountries();
    }

    @Get('metadata/divisions/:countryId')
    async getDivisionsByCountry(@Param('countryId') countryId: number) {
        return this.adminTourService.getDivisionsByCountry(countryId);
    }

    @Get('metadata/currencies')
    async getCurrencies() {
        return this.adminTourService.getCurrencies();
    }

    @Get('getById/:id')
    @ApiParam({ name: 'id', type: Number })
    @ApiResponse({ status: 200, type: TourEntity })
    async getTourById(@Param('id') id: number) {
        return this.adminTourService.getTourById(id);
    }

    @Post('create')
    @ApiBody({ type: TourDTO })
    @ApiResponse({ status: 201, type: TourEntity })
    async createTour(@Body() dto: TourDTO) {
        return this.adminTourService.createTour(dto);
    }

    @Put('update/:id')
    @ApiParam({ name: 'id', type: Number })
    @ApiBody({ type: TourDTO })
    @ApiResponse({ status: 200, type: TourEntity })
    async updateTour(@Param('id') id: number, @Body() dto: Partial<TourDTO>) {
        return this.adminTourService.updateTour(id, dto);
    }

    @Patch('status/:id')
    @ApiParam({ name: 'id', type: Number })
    @ApiBody({
        schema: { type: 'object', properties: { status: { type: 'string' } } },
    })
    async updateStatus(
        @Param('id') id: number,
        @Body('status') status: string,
    ) {
        return this.adminTourService.updateStatus(id, status);
    }

    @Delete('remove/:id')
    @ApiParam({ name: 'id', type: Number })
    async removeTour(@Param('id') id: number) {
        return this.adminTourService.removeTour(id);
    }
}
