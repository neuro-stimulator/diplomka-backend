import { Controller} from '@nestjs/common';

@Controller()
export class AppController {

  // private static readonly SEQUENCE_SIZE = 100;

  // private readonly logger = new Logger(AppController.name);

  constructor() {
  }

  // @Get()
  // getHello(): any {
  //   const sequence: number[] = this.appService.generateSequence([
  //     {
  //       value: 1,
  //       likelihood: 0.2,
  //       dependencies: [
  //         {
  //           stimul: 0,
  //           occurrence: 2,
  //           inRow: true,
  //         },
  //       ],
  //     },
  //     {
  //       value: 2,
  //       likelihood: 0.1,
  //       dependencies: [
  //         {
  //           stimul: 1,
  //           occurrence: 2,
  //           inRow: false,
  //         },
  //       ],
  //     },
  //   ], AppController.SEQUENCE_SIZE);
  //   const analyse = this.appService.analyseSequence(sequence);
  //
  //   return { sequence, analyse };
  // }
}
