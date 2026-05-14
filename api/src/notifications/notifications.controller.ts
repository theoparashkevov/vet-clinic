import { Controller, Delete, Get, Param, Patch } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { StaffAccess } from '../auth/staff-access.decorator';
import { CurrentUser } from '../auth/current-user.decorator';
import { AuthUser } from '../auth/auth.types';

@StaffAccess()
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notifications: NotificationsService) {}

  @Get()
  list(@CurrentUser() user: AuthUser) {
    return this.notifications.listForUser(user.sub);
  }

  @Patch('read-all')
  markAllRead(@CurrentUser() user: AuthUser) {
    return this.notifications.markAllRead(user.sub);
  }

  @Patch(':id/read')
  markRead(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.notifications.markRead(id, user.sub);
  }

  @Delete('all')
  clearAll(@CurrentUser() user: AuthUser) {
    return this.notifications.clearAll(user.sub);
  }

  @Delete(':id')
  dismiss(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.notifications.dismiss(id, user.sub);
  }
}
