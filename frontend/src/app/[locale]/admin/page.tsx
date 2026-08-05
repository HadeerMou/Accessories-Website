"use client";

import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminLogin } from "@/components/admin/AdminLogin";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { ProductModal } from "@/components/admin/ProductModal";
import { Toast } from "@/components/admin/Toast";
import { useAdminDashboard } from "@/hooks/useAdminDashboard";
import { CustomersView } from "@/components/admin/views/CustomersView";
import { DiscountsView } from "@/components/admin/views/DiscountsView";
import { OrdersView } from "@/components/admin/views/OrdersView";
import { OverviewView } from "@/components/admin/views/OverviewView";
import { ProductsView } from "@/components/admin/views/ProductsView";
import { ReviewsView } from "@/components/admin/views/ReviewsView";

export default function AdminDashboard() {
  const dashboard = useAdminDashboard();

  if (dashboard.checkingAuth) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#1f2b25] text-sm text-white/60">
        Loading Aura administration…
      </div>
    );
  }

  if (!dashboard.token) {
    return <AdminLogin onLogin={dashboard.login} />;
  }

  const normalizedQuery = dashboard.query.toLowerCase();

  const visibleProducts = dashboard.products.filter((product) =>
    product.name.toLowerCase().includes(normalizedQuery),
  );

  const visibleCustomers = dashboard.customers.filter(
    (customer) =>
      customer.fullName.toLowerCase().includes(normalizedQuery) ||
      customer.email.toLowerCase().includes(normalizedQuery),
  );

  const visibleDiscounts = dashboard.discounts.filter((discount) =>
    discount.code.toLowerCase().includes(normalizedQuery),
  );

  const visibleReviews = dashboard.reviews.filter(
    (review) =>
      review.product.nameEn.toLowerCase().includes(normalizedQuery) ||
      review.user.fullName.toLowerCase().includes(normalizedQuery) ||
      Boolean(review.comment?.toLowerCase().includes(normalizedQuery)),
  );

  return (
    <div className="min-h-screen bg-[#f6f5f1] font-sans text-[#252622]">
      <AdminSidebar
        section={dashboard.section}
        mobileNav={dashboard.mobileNav}
        orders={dashboard.orders}
        onClose={() => dashboard.setMobileNav(false)}
        onNavigate={dashboard.navigateFromSidebar}
        onLogout={dashboard.logout}
      />

      <div className="lg:pl-[248px]">
        <AdminHeader
          query={dashboard.query}
          searchSuggestions={dashboard.searchSuggestions}
          isSearchDebouncing={dashboard.isSearchDebouncing}
          notifications={dashboard.notifications}
          notificationsOpen={dashboard.notificationsOpen}
          onOpenNavigation={() => dashboard.setMobileNav(true)}
          onQueryChange={dashboard.setQuery}
          onSelectSearchSuggestion={(suggestion) => {
            dashboard.setSection(suggestion.section);
            dashboard.setQuery(suggestion.searchValue);
            dashboard.setFilter("All");
          }}
          onToggleNotifications={() =>
            dashboard.setNotificationsOpen((value) => !value)
          }
          onCloseNotifications={() => dashboard.setNotificationsOpen(false)}
          onNavigate={dashboard.setSection}
        />

        <main className="mx-auto max-w-[1500px] px-5 py-8 md:px-8 lg:px-10 lg:py-10">
          {dashboard.section === "Overview" && (
            <OverviewView
              orders={dashboard.orders}
              products={dashboard.products}
              overview={dashboard.overview}
              onNavigate={dashboard.setSection}
            />
          )}

          {dashboard.section === "Orders" && (
            <OrdersView
              orders={dashboard.visibleOrders}
              filter={dashboard.filter}
              setFilter={dashboard.setFilter}
              updateOrder={dashboard.updateOrder}
            />
          )}

          {dashboard.section === "Products" && (
            <ProductsView
              products={visibleProducts}
              setProducts={dashboard.setProducts}
              token={dashboard.token}
              openCreate={dashboard.openCreateProduct}
              openEdit={dashboard.openEditProduct}
              notify={dashboard.notify}
            />
          )}

          {dashboard.section === "Customers" && (
            <CustomersView customers={visibleCustomers} />
          )}

          {dashboard.section === "Discounts" && (
            <DiscountsView
              discounts={visibleDiscounts}
              setDiscounts={dashboard.setDiscounts}
              token={dashboard.token}
              notify={dashboard.notify}
            />
          )}

          {dashboard.section === "Reviews" && (
            <ReviewsView
              reviews={visibleReviews}
              setReviews={dashboard.setReviews}
              token={dashboard.token}
              notify={dashboard.notify}
            />
          )}
        </main>
      </div>

      {dashboard.showProduct && (
        <ProductModal
          product={dashboard.editingProduct}
          categories={dashboard.categories}
          close={dashboard.closeProductModal}
          save={dashboard.saveProduct}
          createCategory={dashboard.createCategory}
          notify={dashboard.notify}
        />
      )}

      <Toast message={dashboard.toast} />
    </div>
  );
}
