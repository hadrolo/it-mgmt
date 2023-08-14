# IT-Mgmt
This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 15.1.3.

# Configuration
First of all you must choose between 3 types of authentication functionality:
- Standalone - Use own user table 
- Universe - Use universe db structure
- SSO - Single sign on windows azure and own user table (under development)

## Framework
1) Generate database based on `api/service/create_fw_Tables.sql`
2) Import basic rights `api/service/create_fw_Tables.sql`
3) Configure `api/config-standalone.php` or `api/config-universe.php`
4) Set correct api config in `api/config-standalone.php`

## Client
1) Configure Framework `src/app/framework/app.settings.ts`
2) Configure Routing - use necessary guards (`StandaloneGuard`, `TokenGuard`, `LoggedInGuard`)
3) Load rights with the `RightLoaderGuard`

## Rights
Protect Routes with `RightGuard` like `data: {rights: ['Right/openRights']}, canActivate: [RightGuard]}`
