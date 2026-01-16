import { Test, TestingModule } from '@nestjs/testing';
import { RetailSaleController } from './retail-sale.controller';

describe('RetailSaleController', () => {
  let controller: RetailSaleController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RetailSaleController],
    }).compile();

    controller = module.get<RetailSaleController>(RetailSaleController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
