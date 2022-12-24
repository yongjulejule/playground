// @Module() : provides metadata that Nest makes use of to organize the application structure.
import { Module } from '@nestjs/common';
import { FullNestService } from './full-nest.service';
import { FullNestController } from './full-nest.controller';

/**
 * @Global() : 모든 모듈에서 사용할 수 있도록 함
 * @Module({
 * providers: [FullNestService],
 * 	- the providers that will be instantiated by the Nest injector and that may be shared at least across this module
 * controllers: [FullNestController],
 * 	- the set of controllers defined in this module which have to be instantiated
 * imports: [/* import other modules * /],
 * 	- the list of imported modules that export the providers which are required in this module
 * exports: [/* export providers to other modules * / ],
 * 	- FullNestService 를 공유하고 싶으면 이와 같이 export
 * })
 */
@Module({
  controllers: [FullNestController],
  providers: [FullNestService],
})
export class FullNestModule {
  // 여기서도 providers 를 inject 할 수 있음
  // constructor(private: fullNestService : FullNestService) {}
}

// Dynamic Module 은 모르겠다~
