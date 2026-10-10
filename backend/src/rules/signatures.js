/**
 * Technology detection rules for DriftCheck deterministic scanner.
 * All rules are backed by explicit dependency names, file patterns, docker-compose images,
 * and environment variable markers.
 */

export const signatures = [
  {
    id: 'react',
    name: 'React',
    aliases: ['react', 'react.js', 'reactjs', 'frontend', 'ui', 'client', 'web app'],
    dependencies: ['react', 'react-dom'],
    importPatterns: [
      /(?:from\s+['"]react['"]|require\(\s*['"]react['"]\))/i
    ],
    filePatterns: [/\.(jsx|tsx)$/]
  },
  {
    id: 'api',
    name: 'Express / Node API',
    aliases: ['api', 'backend', 'express', 'node', 'server', 'node.js', 'rest api', 'web server'],
    dependencies: ['express', 'fastify', 'koa', 'nestjs', '@nestjs/core'],
    importPatterns: [
      /(?:from\s+['"]express['"]|require\(\s*['"]express['"]\))/i,
      /(?:from\s+['"]fastify['"]|require\(\s*['"]fastify['"]\))/i
    ],
    dockerPatterns: [/image:\s*node(?::|\s|$)/i, /FROM\s+node(?::|\s|$)/i],
    envPatterns: [/\bPORT=/i, /\bAPI_URL=/i]
  },
  {
    id: 'postgres',
    name: 'PostgreSQL',
    aliases: ['postgres', 'postgresql', 'pg', 'postgres db', 'sql db', 'relational db', 'psql'],
    dependencies: ['pg', 'pg-promise', 'postgres', 'sequelize', 'typeorm', 'knex', '@neondatabase/serverless'],
    importPatterns: [
      /(?:from\s+['"]pg['"]|require\(\s*['"]pg['"]\))/i,
      /(?:from\s+['"]pg-promise['"]|require\(\s*['"]pg-promise['"]\))/i,
      /(?:from\s+['"]postgres['"]|require\(\s*['"]postgres['"]\))/i
    ],
    dockerPatterns: [/image:\s*postgres(?::|\s|$)/i, /POSTGRES_DB/i, /POSTGRES_USER/i],
    envPatterns: [/POSTGRES_/i, /PG_HOST/i, /DATABASE_URL=.*postgres/i]
  },
  {
    id: 'redis',
    name: 'Redis',
    aliases: ['redis', 'redis cache', 'redis-server', 'cache', 'key-value store'],
    dependencies: ['redis', 'ioredis'],
    importPatterns: [
      /(?:from\s+['"]redis['"]|require\(\s*['"]redis['"]\))/i,
      /(?:from\s+['"]ioredis['"]|require\(\s*['"]ioredis['"]\))/i
    ],
    dockerPatterns: [/image:\s*redis(?::|\s|$)/i],
    envPatterns: [/REDIS_/i, /REDIS_URL/i]
  },
  {
    id: 'stripe',
    name: 'Stripe',
    aliases: ['stripe', 'stripe payments', 'payment gateway', 'billing', 'payments'],
    dependencies: ['stripe', '@stripe/stripe-js'],
    importPatterns: [
      /(?:from\s+['"]stripe['"]|require\(\s*['"]stripe['"]\))/i,
      /(?:from\s+['"]@stripe\/stripe-js['"]|require\(\s*['"]@stripe\/stripe-js['"]\))/i
    ],
    envPatterns: [/STRIPE_SECRET_KEY/i, /STRIPE_PUBLISHABLE_KEY/i, /STRIPE_WEBHOOK_SECRET/i]
  },
  {
    id: 'mongodb',
    name: 'MongoDB',
    aliases: ['mongo', 'mongodb', 'mongoose', 'nosql', 'document db'],
    dependencies: ['mongodb', 'mongoose'],
    importPatterns: [
      /(?:from\s+['"]mongodb['"]|require\(\s*['"]mongodb['"]\))/i,
      /(?:from\s+['"]mongoose['"]|require\(\s*['"]mongoose['"]\))/i
    ],
    dockerPatterns: [/image:\s*mongo(?::|\s|$)/i, /MONGO_INITDB_/i],
    envPatterns: [/MONGODB_URI/i, /MONGO_URL/i, /MONGO_HOST/i]
  },
  {
    id: 'rabbitmq',
    name: 'RabbitMQ',
    aliases: ['rabbitmq', 'rabbit', 'amqp', 'message broker', 'message queue', 'queue'],
    dependencies: ['amqplib', 'rhea', 'amqp-connection-manager'],
    importPatterns: [
      /(?:from\s+['"]amqplib['"]|require\(\s*['"]amqplib['"]\))/i,
      /(?:from\s+['"]amqp-connection-manager['"]|require\(\s*['"]amqp-connection-manager['"]\))/i
    ],
    dockerPatterns: [/image:\s*rabbitmq(?::|\s|$)/i],
    envPatterns: [/RABBITMQ_URL/i, /RABBITMQ_HOST/i, /AMQP_URL/i]
  },
  // --- 5 Additional Technologies for Task 4 ---
  {
    id: 'supabase',
    name: 'Supabase',
    aliases: ['supabase', 'supabase db', 'supabase auth'],
    dependencies: ['@supabase/supabase-js', '@supabase/ssr'],
    importPatterns: [
      /(?:from\s+['"]@supabase\/supabase-js['"]|require\(\s*['"]@supabase\/supabase-js['"]\))/i
    ],
    envPatterns: [/SUPABASE_URL/i, /SUPABASE_ANON_KEY/i, /SUPABASE_SERVICE_ROLE_KEY/i]
  },
  {
    id: 'prisma',
    name: 'Prisma',
    aliases: ['prisma', 'prisma orm'],
    dependencies: ['@prisma/client', 'prisma'],
    importPatterns: [
      /(?:from\s+['"]@prisma\/client['"]|require\(\s*['"]@prisma\/client['"]\))/i
    ],
    filePatterns: [/schema\.prisma$/i]
  },
  {
    id: 'neon',
    name: 'Neon',
    aliases: ['neon', 'neon database', 'neon postgres', 'neon serverless'],
    dependencies: ['@neondatabase/serverless'],
    importPatterns: [
      /(?:from\s+['"]@neondatabase\/serverless['"]|require\(\s*['"]@neondatabase\/serverless['"]\))/i
    ],
    envPatterns: [/NEON_DATABASE_URL/i, /DATABASE_URL=.*neon\.tech/i]
  },
  {
    id: 'sentry',
    name: 'Sentry',
    aliases: ['sentry', 'sentry error tracking', 'error monitoring'],
    dependencies: ['@sentry/node', '@sentry/react', '@sentry/browser', '@sentry/nextjs'],
    importPatterns: [
      /(?:from\s+['"]@sentry\/(?:node|react|browser|nextjs)['"]|require\(\s*['"]@sentry\/(?:node|react|browser|nextjs)['"]\))/i
    ],
    envPatterns: [/SENTRY_DSN/i, /SENTRY_AUTH_TOKEN/i]
  },
  {
    id: 'auth0',
    name: 'Auth0',
    aliases: ['auth0', 'auth0 auth', 'identity provider'],
    dependencies: ['@auth0/auth0-react', 'auth0', 'express-openid-connect', '@auth0/nextjs-auth0'],
    importPatterns: [
      /(?:from\s+['"]@auth0\/(?:auth0-react|nextjs-auth0)['"]|require\(\s*['"]@auth0\/(?:auth0-react|nextjs-auth0)['"]\))/i,
      /(?:from\s+['"]express-openid-connect['"]|require\(\s*['"]express-openid-connect['"]\))/i
    ],
    envPatterns: [/AUTH0_DOMAIN/i, /AUTH0_CLIENT_ID/i, /AUTH0_CLIENT_SECRET/i]
  }
];

/**
 * Find a signature matching a component name or alias.
 */
export function findSignature(componentName) {
  if (!componentName) return null;
  const normalized = componentName.trim().toLowerCase();

  return signatures.find(sig => {
    if (sig.id === normalized || sig.name.toLowerCase() === normalized) {
      return true;
    }
    return sig.aliases && sig.aliases.some(alias => {
      // Direct alias match or word boundary match
      if (alias === normalized) return true;
      if (normalized.includes(alias) || alias.includes(normalized)) return true;
      return false;
    });
  }) || null;
}
