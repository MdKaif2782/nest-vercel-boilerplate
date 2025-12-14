import { Test, TestingModule } from '@nestjs/testing';
import { ChallanController } from './challan.controller';
import { ChallanService } from './challan.service';

describe('ChallanController', () => {
  let controller: ChallanController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChallanController],
      providers: [ChallanService],
    }).compile();

    controller = module.get<ChallanController>(ChallanController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
