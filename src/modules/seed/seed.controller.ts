import { Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { SeedService } from './seed.service';

@Controller('seed')
export class SeedController {
  constructor(private readonly seedService: SeedService) {}

  /**
   * POST /seed/reset-and-seed
   * Resets the entire database and seeds it with default data
   * including admin user, investors, employees, POs, inventory, etc.
   */
  @Post('reset-and-seed')
  @HttpCode(HttpStatus.OK)
  async resetAndSeed() {
    return this.seedService.resetAndSeedAll();
  }

  /**
   * POST /seed/reset-and-seed-employees
   * Resets only employee-related tables (employees, salaries, advances)
   * and seeds them with sample employees ready for salary operations.
   */
  @Post('reset-and-seed-employees')
  @HttpCode(HttpStatus.OK)
  async resetAndSeedEmployees() {
    return this.seedService.resetAndSeedEmployees();
  }
}
