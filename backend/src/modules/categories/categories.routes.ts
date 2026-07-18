import { Router } from "express";
import { prisma } from "../../lib/prisma.js";
import { HttpError } from "../../lib/http-error.js";
import { requireAdmin, requireAuth } from "../auth/auth.middleware.js";
export const categoriesRouter = Router();
categoriesRouter.get("/", async (_req,res,next)=>{try{res.json({data:await prisma.category.findMany({where:{deletedAt:null},include:{_count:{select:{products:true}},children:true},orderBy:{nameEn:"asc"}})});}catch(e){next(e);}});
categoriesRouter.post("/",requireAuth,requireAdmin,async(req,res,next)=>{try{if(!req.body.nameEn?.trim()||!req.body.nameAr?.trim())throw new HttpError(400,"nameEn and nameAr are required");res.status(201).json({data:await prisma.category.create({data:{nameEn:req.body.nameEn.trim(),nameAr:req.body.nameAr.trim(),slugEn:req.body.slugEn?.trim()||null,slugAr:req.body.slugAr?.trim()||null,parentId:req.body.parentId||null}})});}catch(e){next(e);}});
categoriesRouter.put("/:id",requireAuth,requireAdmin,async(req,res,next)=>{try{res.json({data:await prisma.category.update({where:{id:req.params.id as string},data:{...req.body,updatedAt:new Date()}})});}catch(e){next(e);}});
categoriesRouter.delete("/:id",requireAuth,requireAdmin,async(req,res,next)=>{try{const count=await prisma.product.count({where:{categoryId:req.params.id as string,deletedAt:null}});if(count)throw new HttpError(409,"Cannot delete a category that contains products");await prisma.category.update({where:{id:req.params.id as string},data:{deletedAt:new Date()}});res.status(204).send();}catch(e){next(e);}});
