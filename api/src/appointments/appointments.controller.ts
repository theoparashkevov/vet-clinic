import { Controller, Get, Query } from '@nestjs/common';

@Controller('appointments')
export class AppointmentsController {
  @Get('slots')
  getSlots(@Query('date') date: string) {
    // TODO: move to service + config hours; mock for now
    const base = new Date(date || new Date().toISOString().slice(0,10));
    const mk = (h: number, m: number) => {
      const d = new Date(base);
      d.setHours(h, m, 0, 0);
      return d.toISOString();
    };
    return {
      date: (date || base.toISOString().slice(0,10)),
      slots: [mk(9,0), mk(9,20), mk(9,40), mk(10,0), mk(10,20), mk(10,40)]
    };
  }
}
