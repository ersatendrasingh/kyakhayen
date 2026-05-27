import { ContactLeadStatus, PaymentStatus } from "@prisma/client";

import {
  AdminDashboard,
  type AdminDashboardData,
} from "@/components/admin/dashboard/admin-dashboard";
import { db } from "@/lib/db";

function monthsUntilNow(value: Date, count: number) {
  return Array.from({ length: count }, (_, index) => {
    const offset = count - index - 1;
    return new Date(value.getFullYear(), value.getMonth() - offset, 1);
  });
}

function weeksUntilNow(value: Date, count: number) {
  const weekStart = new Date(value);
  weekStart.setHours(0, 0, 0, 0);
  weekStart.setDate(weekStart.getDate() - ((weekStart.getDay() + 6) % 7));
  return Array.from({ length: count }, (_, index) => {
    const start = new Date(weekStart);
    start.setDate(weekStart.getDate() - (count - index - 1) * 7);
    return start;
  });
}

const DashboardPage = async () => {
  const now = new Date();
  const monthBuckets = monthsUntilNow(now, 6);
  const weekBuckets = weeksUntilNow(now, 8);
  const since = monthBuckets[0];

  const [
    recipes,
    articles,
    ingredients,
    users,
    memberships,
    orders,
    comments,
    reviews,
    leads,
    mediaAssets,
  ] = await Promise.all([
    db.recipes.findMany({
      select: {
        id: true,
        title: true,
        views: true,
        imageUrl: true,
        isPublished: true,
        _count: {
          select: {
            Favorite: true,
            Review: true,
            recipeIngredients: true,
            recipeMethods: true,
          },
        },
      },
    }),
    db.post.findMany({
      select: { id: true, title: true, imageUrl: true, isPublished: true, createdAt: true },
    }),
    db.ingredients.findMany({
      select: { isPublished: true, calories: true, protein: true },
    }),
    db.user.findMany({
      select: {
        id: true,
        createdAt: true,
        isActive: true,
        isPersonalised: true,
        emailVerified: true,
      },
    }),
    db.userPlan.findMany({
      where: {
        user: { isActive: true },
        OR: [{ endDate: null }, { endDate: { gte: now } }],
      },
      select: { plan: { select: { name: true } } },
    }),
    db.order.findMany({
      select: {
        id: true,
        orderId: true,
        totalAmount: true,
        currency: true,
        paymentStatus: true,
        createdAt: true,
        user: { select: { name: true } },
        items: { take: 1, select: { itemName: true, plan: { select: { name: true } } } },
      },
      orderBy: { createdAt: "desc" },
    }),
    db.comment.findMany({
      select: { isPublished: true, createdAt: true },
    }),
    db.review.findMany({
      select: { isPublished: true, rating: true, createdAt: true },
    }),
    db.contactUsQueries.findMany({
      select: {
        id: true,
        name: true,
        status: true,
        createdAt: true,
        lastContactedAt: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    db.mediaAsset.count(),
  ]);

  const paidOrders = orders.filter(
    (order) =>
      (order.paymentStatus === PaymentStatus.Paid || order.paymentStatus === PaymentStatus.Success) &&
      (!order.currency || order.currency === "INR"),
  );
  const paidRevenue = paidOrders.reduce((total, order) => total + (order.totalAmount || 0), 0);
  const publishedRecipes = recipes.filter((recipe) => recipe.isPublished);
  const activeUsers = users.filter((user) => user.isActive);

  const planCounts = memberships.reduce<Record<string, number>>((result, membership) => {
    result[membership.plan.name] = (result[membership.plan.name] || 0) + 1;
    return result;
  }, {});

  const dashboardData: AdminDashboardData = {
    generatedAt: now.toISOString(),
    stats: {
      paidRevenue,
      paidOrders: paidOrders.length,
      totalUsers: users.length,
      activeMembers: memberships.length,
      publishedRecipes: publishedRecipes.length,
      totalRecipes: recipes.length,
      actionItems:
        comments.filter((comment) => !comment.isPublished).length +
        reviews.filter((review) => !review.isPublished).length +
        leads.filter((lead) => lead.status === ContactLeadStatus.NEW || lead.status === ContactLeadStatus.FOLLOW_UP)
          .length +
        orders.filter((order) => order.paymentStatus === PaymentStatus.Processing).length,
    },
    revenue: monthBuckets.map((start, index) => {
      const end = monthBuckets[index + 1] || new Date(now.getFullYear(), now.getMonth() + 1, 1);
      const monthOrders = paidOrders.filter(
        (order) => order.createdAt >= start && order.createdAt < end && order.createdAt >= since,
      );
      return {
        label: start.toLocaleDateString("en-IN", { month: "short" }),
        value: monthOrders.reduce((total, order) => total + (order.totalAmount || 0), 0),
        orders: monthOrders.length,
      };
    }),
    registrations: weekBuckets.map((start, index) => {
      const end = weekBuckets[index + 1] || new Date(now.getTime() + 86_400_000);
      return {
        label: start.toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
        value: users.filter((user) => user.createdAt >= start && user.createdAt < end).length,
      };
    }),
    audience: {
      active: activeUsers.length,
      personalised: users.filter((user) => user.isPersonalised).length,
      verified: users.filter((user) => Boolean(user.emailVerified)).length,
      plans: Object.entries(planCounts)
        .map(([label, value]) => ({ label, value }))
        .sort((first, second) => second.value - first.value),
    },
    health: [
      {
        label: "Recipes live",
        value: publishedRecipes.length,
        total: recipes.length,
        href: "/admin/recipes",
      },
      {
        label: "Recipe build complete",
        value: recipes.filter(
          (recipe) => recipe._count.recipeIngredients > 0 && recipe._count.recipeMethods > 0,
        ).length,
        total: recipes.length,
        href: "/admin/recipes",
      },
      {
        label: "Articles live",
        value: articles.filter((article) => article.isPublished).length,
        total: articles.length,
        href: "/admin/articles",
      },
      {
        label: "Nutrition catalog ready",
        value: ingredients.filter(
          (ingredient) => ingredient.isPublished && ingredient.calories !== null && ingredient.protein !== null,
        ).length,
        total: ingredients.length,
        href: "/admin/ingredients",
      },
    ],
    inventory: {
      articles: articles.length,
      ingredients: ingredients.length,
      media: mediaAssets,
    },
    topRecipes: recipes
      .slice()
      .sort((first, second) => second.views - first.views)
      .slice(0, 5)
      .map((recipe) => ({
        id: recipe.id,
        title: recipe.title,
        views: recipe.views,
        favorites: recipe._count.Favorite,
        reviews: recipe._count.Review,
        published: recipe.isPublished,
      })),
    pipeline: [
      { label: "New", value: leads.filter((lead) => lead.status === ContactLeadStatus.NEW).length },
      {
        label: "Talking",
        value: leads.filter(
          (lead) =>
            lead.status === ContactLeadStatus.CONTACTED ||
            lead.status === ContactLeadStatus.INTERESTED ||
            lead.status === ContactLeadStatus.FOLLOW_UP,
        ).length,
      },
      {
        label: "Converted",
        value: leads.filter((lead) => lead.status === ContactLeadStatus.CONVERTED).length,
      },
      {
        label: "Closed",
        value: leads.filter(
          (lead) => lead.status === ContactLeadStatus.CLOSED || lead.status === ContactLeadStatus.NOT_INTERESTED,
        ).length,
      },
    ],
    queue: [
      {
        label: "Comments awaiting approval",
        value: comments.filter((comment) => !comment.isPublished).length,
        href: "/admin/community?tab=comments",
        tone: "amber",
      },
      {
        label: "Reviews awaiting approval",
        value: reviews.filter((review) => !review.isPublished).length,
        href: "/admin/community?tab=reviews",
        tone: "amber",
      },
      {
        label: "Fresh or follow-up leads",
        value: leads.filter((lead) => lead.status === ContactLeadStatus.NEW || lead.status === ContactLeadStatus.FOLLOW_UP)
          .length,
        href: "/admin/contact-queries",
        tone: "blue",
      },
      {
        label: "Payments processing",
        value: orders.filter((order) => order.paymentStatus === PaymentStatus.Processing).length,
        href: "/admin/orders",
        tone: "rose",
      },
    ],
    recentOrders: orders.slice(0, 4).map((order) => ({
      id: order.id,
      reference: order.orderId || `#${order.id.slice(-7).toUpperCase()}`,
      customer: order.user.name || "Member",
      plan: order.items[0]?.plan?.name || order.items[0]?.itemName || "Membership",
      amount: order.totalAmount || 0,
      currency: order.currency || "INR",
      status: order.paymentStatus,
      createdAt: order.createdAt.toISOString(),
    })),
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <AdminDashboard data={dashboardData} />
    </div>
  );
};

export default DashboardPage;
