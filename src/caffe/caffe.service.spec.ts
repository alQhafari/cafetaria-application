import { Test, TestingModule } from '@nestjs/testing';
import { CaffeService } from './caffe.service';

describe('CaffeService', () => {
  let service: CaffeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CaffeService],
    }).compile();

    service = module.get<CaffeService>(CaffeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
