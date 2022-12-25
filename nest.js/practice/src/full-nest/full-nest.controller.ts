// Controller : Controllers are responsible for handling incoming requests and returning responses to the client.
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FullNestService } from './full-nest.service';
import { CreateFullNestDto } from './dto/create-full-nest.dto';
import { UpdateFullNestDto } from './dto/update-full-nest.dto';
import { RolesGuard } from '../roles.guard';
import { Roles } from '../roles.decorator';
import { LoggingInterceptor } from '../logging.interceptor';
import { TransformInterceptor } from '../transform.interceptor';
import { TimeoutInterceptor } from '../timeout.interceptor';

// @Controller(arg) : arg 를 라우팅 경로로 사용하는 컨트롤러를 생성
// @param arg : string | string[] , 라우팅할 경로를 지정하며 정규식의 일부 ("*", "+", "?", "(", ")" ) 를 사용할 수 있음
@Controller('full-nest')
// @UseGuards() : 사용할 Guard 를 지정. 여러개의 Guard 를 사용할 수 있음
@UseGuards(RolesGuard)
@UseInterceptors(LoggingInterceptor)
export class FullNestController {
  constructor(private readonly fullNestService: FullNestService) {}

  /*   
	SECTION : 함수 전 단계에 적용되는 decorator
	HTTP Method decorators : @Get(), @Post(), @Put(), @Delete(), @Patch(), @Options(), @Head(), @All()
  @Get('test') : /cat/test 로 Get 요청이 들어왔을 때 실행됨
  @Get(':id') : /cat/:id 로 Get 요청이 들어왔을 때 실행되며 parameter 를 받을 수 있어짐
  @HttpCode(status: number) : HTTP 응답의 상태 코드를 지정할 수 있음
  @Header(field-name: string, field-value: string) : HTTP 응답의 헤더를 지정할 수 있음
  @Redirect(url: string, status: number) : 리다이렉션 및 상태코드 지정할 수 있음 
	
	SECTION : 함수 안에서 적용되는 decorator
	@Body(key? : string) : HTTP 요청의 body 를 받아옴
	@Param(key? : string) : HTTP 요청의 parameter 를 받아옴 => param : any
		- @Param('id') : HTTP 요청의 parameter 중 id 를 받아옴 => id : string | number
	@Query(key? : string) : HTTP 요청의 query 를 받아옴
	*/
  @Post()
  create(@Body() createFullNestDto: CreateFullNestDto) {
    return this.fullNestService.create(createFullNestDto);
  }

  @Get()
  @Roles('admin')
  // 여기로 요청이 왔을 때 RolesGuard 가 실행되고, RolesGuard 가 true 를 반환하면 아래 함수가 실행됨
  // @Roles() 는 RolesGuard 에서 reflector 을 통하여 roles 를 받아오는데 사용됨
  findAll(@Query() query: any) {
    console.log(query);
    return this.fullNestService.findAll();
  }

  @Get(':id')
  @UseInterceptors(TransformInterceptor)
  findOne(@Param('id') id: string) {
    return this.fullNestService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateFullNestDto: UpdateFullNestDto,
  ) {
    return this.fullNestService.update(+id, updateFullNestDto);
  }

  @Delete(':id')
  @UseInterceptors(TimeoutInterceptor)
  async remove(@Param('id') id: string) {
    console.log(id);
    if (id == '1') {
      console.log('hihi');
      await new Promise((r) => setTimeout(r, 3000));

      console.log('hi');
    }
    return this.fullNestService.remove(+id);
  }
}
