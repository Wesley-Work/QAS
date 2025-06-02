import { Middleware, Context } from 'koa';

// Express中间件适配器
export function expressMiddleware(expressMiddleware: any): Middleware {
  return async (ctx: Context, next: () => Promise<void>) => {
    const res: any = ctx.res;
    const req: any = ctx.req;

    // 添加Express特有的方法
    res.send = (body: any) => {
      ctx.body = body;
    };

    res.json = (json: any) => {
      ctx.body = json;
    };

    res.status = (code: number) => {
      ctx.status = code;
      return res;
    };

    // 包装Express中间件
    await new Promise((resolve, reject) => {
      expressMiddleware(req, res, (err: any) => {
        if (err) reject(err);
        else resolve(next());
      });
    });
  };
}

// Express应用适配器
export function createExpressAdapter() {
  return {
    // 转换Express路由处理器
    route(handler: any): Middleware {
      return expressMiddleware(handler);
    },

    // 转换Express中间件
    use(middleware: any): Middleware {
      return expressMiddleware(middleware);
    },
  };
}
