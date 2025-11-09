import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { Auth } from 'firebase-admin/lib/auth/auth';
import { AuthModule } from '../auth/auth.module';
import { InvestorModule } from '../investor/investor.module';
import { PoModule } from '../po/po.module';
import { InventoryModule } from '../inventory/inventory.module';
import { QuotationModule } from '../quotation/quotation.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
    }),
    AuthModule,
    InvestorModule,
    PoModule,
    InventoryModule,
    QuotationModule
    //FirebaseModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
