import { Controller } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { UserService } from "../service/user.service";

@ApiTags('Admin User')
@Controller('admin/user')
export class AdminUserController {
    constructor(private readonly userService: UserService) { }
}