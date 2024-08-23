import { Test, TestingModule } from '@nestjs/testing';
import { CaffeController } from './caffe.controller';
import { CaffeService } from './caffe.service';

describe('CaffeController', () => {
  let controller: CaffeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CaffeController],
      providers: [CaffeService],
    }).compile();

    controller = module.get<CaffeController>(CaffeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
