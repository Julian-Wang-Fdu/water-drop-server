import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ProductService } from "./product.service";
import { ProductResolver } from "./product.resolver";
import { Product } from "./modules/product.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Product])],
  providers: [ProductService, ProductResolver],
  exports: [ProductService],
})
export class ProductModule {}