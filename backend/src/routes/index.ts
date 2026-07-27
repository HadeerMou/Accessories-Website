import { Router } from "express";
import { productsRouter } from "../modules/products/products.routes.js";
import { ordersRouter } from "../modules/orders/orders.routes.js";
import { usersRouter } from "../modules/users/users.routes.js";
import { authRouter } from "../modules/auth/auth.routes.js";
import { categoriesRouter } from "../modules/categories/categories.routes.js";
import { cartRouter } from "../modules/cart/cart.routes.js";
import { paymentsRouter } from "../modules/payments/payments.routes.js";
import { adminRouter } from "../modules/admin/admin.routes.js";
import { addressesRouter } from "../modules/addresses/addresses.routes.js";
import { discountsRouter } from "../modules/discounts/discounts.routes.js";
import { reviewsRouter } from "../modules/reviews/reviews.routes.js";

export const apiRouter = Router();

apiRouter.get("/health", (_request, response) => {
  response.json({ status: "ok" });
});

apiRouter.use("/products", productsRouter);
apiRouter.use("/auth", authRouter);
apiRouter.use("/categories", categoriesRouter);
apiRouter.use("/cart", cartRouter);
apiRouter.use("/payments", paymentsRouter);
apiRouter.use("/admin", adminRouter);
apiRouter.use("/addresses", addressesRouter);
apiRouter.use("/users", usersRouter);
apiRouter.use("/orders", ordersRouter);
apiRouter.use("/discounts", discountsRouter);
apiRouter.use("/reviews", reviewsRouter);
