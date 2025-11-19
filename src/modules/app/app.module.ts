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
import { OrderModule } from '../order/order.module';
import { BillModule } from '../bill/bill.module';
import { EmployeeModule } from '../employee/employee.module';
import { ExpenseModule } from '../expense/expense.module';

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
    QuotationModule,
    OrderModule,
    BillModule,
    EmployeeModule,
    ExpenseModule
    //FirebaseModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
