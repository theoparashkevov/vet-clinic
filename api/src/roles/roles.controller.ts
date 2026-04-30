import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto, AssignRolesDto } from './dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../auth/current-user.decorator';
import { AuthUser } from '../auth/auth.types';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  list() {
    return this.rolesService.list();
  }

  @Post()
  @Roles('superadmin', 'admin')
  create(@Body() dto: CreateRoleDto) {
    return this.rolesService.create(dto);
  }
}

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UserRolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post(':id/roles')
  @Roles('superadmin', 'admin')
  assignRoles(
    @Param('id') userId: string,
    @Body() dto: AssignRolesDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.rolesService.assignRolesToUser(userId, dto.roleIds, user.sub);
  }

  @Delete(':id/roles/:roleId')
  @Roles('superadmin', 'admin')
  removeRole(
    @Param('id') userId: string,
    @Param('roleId') roleId: string,
  ) {
    return this.rolesService.removeRoleFromUser(userId, roleId);
  }
}
