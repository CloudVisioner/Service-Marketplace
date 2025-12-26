import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService { //chef
  getHello(): string {
    return "Welcome to NESTAR API Server!";
  }
}
