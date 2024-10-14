import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Organization } from "./modules/organization.entity";
import { OrgImage } from "../orgImage/modules/orgImage.entity";
import { OrganizationService } from "./organization.service";
import { OrganizationResolver } from "./organization.resolver";
import { OrgImageService } from "../orgImage/orgImage.service";

@Module({
  imports: [TypeOrmModule.forFeature([Organization, OrgImage])],
  providers: [OrganizationService, OrganizationResolver, OrgImageService],
  exports: [OrganizationService],
})
export class OrganizationModule {}