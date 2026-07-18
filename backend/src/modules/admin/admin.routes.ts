import { Router } from "express";
import { OrderStatus, PaymentStatus, ProductStatus, UserRole } from "../../generated/prisma/enums.js";
import { prisma } from "../../lib/prisma.js";
import { requireAdmin, requireAuth } from "../auth/auth.middleware.js";
export const adminRouter = Router();
adminRouter.use(requireAuth,requireAdmin);
adminRouter.get("/overview",async(_req,res,next)=>{try{const start=new Date();start.setDate(start.getDate()-30);const [revenue,orders,customers,products,lowStock,recentOrders]=await Promise.all([prisma.order.aggregate({where:{createdAt:{gte:start},paymentStatus:PaymentStatus.PAID},_sum:{total:true}}),prisma.order.count({where:{createdAt:{gte:start},orderStatus:{not:OrderStatus.CANCELLED}}}),prisma.user.count({where:{role:UserRole.CUSTOMER,deletedAt:null}}),prisma.product.count({where:{deletedAt:null,status:{not:ProductStatus.ARCHIVED}}}),prisma.product.findMany({where:{deletedAt:null,stock:{lte:10}},select:{id:true,nameEn:true,sku:true,stock:true},orderBy:{stock:"asc"},take:8}),prisma.order.findMany({include:{user:{select:{fullName:true,email:true}},items:{select:{quantity:true}}},orderBy:{createdAt:"desc"},take:8})]);res.json({data:{revenue:Number(revenue._sum.total??0),orders,customers,products,averageOrderValue:orders?Number(revenue._sum.total??0)/orders:0,lowStock,recentOrders}});}catch(e){next(e);}});
