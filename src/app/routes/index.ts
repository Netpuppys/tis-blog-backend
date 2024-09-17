import express from 'express';
import { AuthRoutes } from '../modules/auth/auth.route';
import { CategoryRoutes } from '../modules/category/category.route';
import { PostRoutes } from '../modules/post/post.route';
import { UserRoutes } from '../modules/user/user.route';
import CommonRoutes from '../modules/common/common.route';

const router = express.Router();

const moduleRoutes = [
  {
    path: '/category',
    routes: CategoryRoutes,
  },
  {
    path: '/post',
    routes: PostRoutes,
  },
  {
    path: '/user',
    routes: UserRoutes,
  },
  {
    path: '/auth',
    routes: AuthRoutes,
  },
  {
    path: '/common',
    routes: CommonRoutes,
  },
];

moduleRoutes.forEach(route => router.use(route.path, route.routes));
export default router;
