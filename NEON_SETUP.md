# Neon Database Setup Guide

This guide will help you configure Neon database for your ECWA Settings application.

## 🚀 Quick Start

### 1. Get Neon Database URL

1. Go to [Neon Console](https://console.neon.tech/)
2. Sign up/Login with GitHub
3. Create a new project
4. Copy your connection string (it looks like: `postgresql://username:password@ep-xxx.us-east-1.aws.neon.tech/neondb`)

### 2. Configure Environment

Add your Neon database URL to `.env.local`:

```bash
# Add this line to your .env.local file
DATABASE_URL=postgresql://username:password@ep-xxx.us-east-1.aws.neon.tech/neondb
```

### 3. Test Connection

```bash
bun run test-neon
```

### 4. Migrate Data

```bash
bun run migrate-neon
```

### 5. Start Application

```bash
bun dev
```

## 📊 Database Schema

The migration will create the following tables:

- **users** - User accounts and authentication
- **organizations** - Church organizations (DCC, GCC, LCC)
- **leaders** - Church leaders and executives
- **agencies** - Ministries, departments, committees
- **staff** - Staff members and employees
- **lc** - Local Churches
- **lcc** - Local Church Councils
- **leave_requests** - Leave management
- **payroll** - Salary and payment records
- **queries** - Support tickets and queries
- **expenditures** - Financial expenditures
- **income** - Income and donations
- **bank_accounts** - Bank account management
- **executives** - Executive positions
- **kv_store** - Key-value storage for compatibility

## 🔧 Features

### ✅ **Advantages over File Storage**

- **No Race Conditions**: Concurrent writes are handled properly
- **ACID Compliance**: Data integrity guaranteed
- **Scalability**: Handles multiple users simultaneously
- **Backup & Recovery**: Automatic backups and point-in-time recovery
- **Performance**: Optimized queries and indexing
- **Security**: Encrypted connections and access controls

### 🔄 **Automatic Fallback**

The application automatically falls back to file storage if:
- `DATABASE_URL` is not set
- Database connection fails
- Neon service is unavailable

## 🛠️ Development Commands

```bash
# Setup Neon integration
bun run setup-neon

# Test database connection
bun run test-neon

# Migrate data from file storage
bun run migrate-neon

# Start development server
bun dev
```

## 🔍 Troubleshooting

### Connection Issues

1. **Check DATABASE_URL**: Ensure it's correctly set in `.env.local`
2. **Verify Database Status**: Check if your Neon database is active
3. **Network Access**: Ensure your IP is whitelisted in Neon console
4. **Connection String**: Verify the format is correct

### Migration Issues

1. **Backup Data**: Always backup your `.data/users.json` file
2. **Check Logs**: Look for specific error messages
3. **Retry Migration**: Run `bun run migrate-neon` again
4. **Manual Migration**: Use the Neon console to import data

### Performance Issues

1. **Index Optimization**: Check if indexes are created properly
2. **Query Analysis**: Use Neon's query analysis tools
3. **Connection Pooling**: Monitor connection usage
4. **Resource Limits**: Check your Neon plan limits

## 📈 Monitoring

### Neon Console Features

- **Query Performance**: Monitor slow queries
- **Connection Usage**: Track active connections
- **Storage Usage**: Monitor database size
- **Backup Status**: Check backup completion
- **Logs**: View application and database logs

### Application Monitoring

- **Error Logs**: Check console for database errors
- **Performance**: Monitor API response times
- **Data Integrity**: Verify data consistency
- **User Experience**: Test all functionality

## 🔒 Security

### Best Practices

1. **Environment Variables**: Never commit database URLs to version control
2. **Access Control**: Use least privilege principle
3. **Connection Security**: Always use SSL/TLS
4. **Regular Updates**: Keep dependencies updated
5. **Backup Strategy**: Regular automated backups

### Neon Security Features

- **Encrypted Connections**: All connections are encrypted
- **IP Whitelisting**: Restrict access by IP address
- **Role-Based Access**: Granular permission control
- **Audit Logs**: Track all database access
- **Compliance**: SOC 2 Type II certified

## 📚 Additional Resources

- [Neon Documentation](https://neon.tech/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Next.js Database Integration](https://nextjs.org/docs/app/building-your-application/data-fetching)
- [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres)

## 🆘 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review Neon console logs
3. Check application console logs
4. Verify environment configuration
5. Contact support if needed

---

**Note**: This setup maintains backward compatibility with your existing file-based storage while providing the benefits of a proper database system.
