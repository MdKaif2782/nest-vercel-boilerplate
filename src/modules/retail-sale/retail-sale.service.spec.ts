import { Test, TestingModule } from '@nestjs/testing';
import { RetailSaleService } from './retail-sale.service';

describe('RetailSaleService', () => {
  let service: RetailSaleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RetailSaleService],
    }).compile();

    service = module.get<RetailSaleService>(RetailSaleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
