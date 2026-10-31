# Azure Role Based Access Control for .NET 5+ & Angular
## Overview
This project is an example for how RBAC (role-based access control) can be 
implemented in a .NET 5+ / Angular application. This uses roles defined on an enterprise
application within Azure AD to determine both front-end and back-end role authorization.

### Benefits
There are likely more benefits than listed, but the following are primary incentives:
1) This method of Authorization utilizes the same system that is used for Authentication. Meaning,
maintenance is reduced since all access control is within one system as opposed to two separate systems,
e.g. Azure AD Authentication & Application (database) Authorization.

2) Reduces code complexity since the system is only concerned with reading in Role scopes 
provided by the Authentication/Authorization system as opposed to reading in the database and
validating a user.
   
3) Cleaner login/logout procedures since all auth is self-contained. Logging out of the 
system means completely discarding all auth information from the client.

## Requirements
### Technical Requirements
- Azure Active Directory
    - 1 Application Registration
    - 1 Enterprise Application (default with App Registration)
    
### Personnel Requirements
- Azure proficiency
- .NET 5/6 proficiency
- Angular proficiency
- Authentication / Authorization concept proficiency
  
## Setup
### Azure Setup
This setup assumes that an Azure Active Directory Tenant is already setup
and that the individual following this guide understands the basics of Azure
and its App Registration process.

1) Setup an App Registration, include at least 1 redirect URI (https://localhost:4200)
    1) Use "Access Tokens" & "ID Tokens"
2) Update the Application ID URI, default should work, but custom is what was used during the creation of this example.
3) Create 1 new Client Secret.
    1) Copy down the generated secret.
4) Expose 1 API.
    1) Add a new scope, copy down the full scope (including the prepended URI).
5) Add 1 new API Permission.
    1) Add the custom scope from #4.i above.
    2) Add two Graph API Scopes (both are Application level scopes):
        1) AppRoleAssignments.ReadWrite.All
        2) Directory.Read.All
        3) Grant admin consent to both
    3) Add the following Microsoft Graph API permissions as Delegated permissions for the delegated administration page:
        1) Application.Read.All
        2) AppRoleAssignment.ReadWrite.All
        3) User.Read.All
        4) Group.Read.All
        5) Grant consent according to your tenant's consent policy.
6) Add roles
    1) Add as many roles as the application requires, this example uses 2 (User.Default & User.Administrator).
    2) Both are "Users/Groups" roles, ensure they are enabled.

### Application Setup
Once Azure AD is setup following the instructions for Azure Setup.

#### API
Since this application is already setup from a code perspective, the only changes
needed are within the Appsettings.json or User Secrets file. This example uses User Secrets 
(replace <> including the < & >).
```
"AzureAd": {
   "Instance": "https://login.microsoftonline.com/",
   "ClientId": "<client_id_from_app_registration>",
   "TenantId": "<directory_(tenant)_id_from_app_registration>",
   "Audience": "<Application_ID_URI_from_app_registration>"
},
"Graph": {
   "TenantId": "<directory_(tenant)_id_from_app_registration>",
   "ClientId": "<client_id_from_app_registration>",
   "ClientSecret": "<client_secret_from_step_#3.i_from_Azure_Setup>",
   "EnterpriseApplicationId": "<object_id_from_Enterprise_Application>",
   "Roles": {
        "User.Default": "<ID_from_app_role_blade>",
        "User.Administrator": "<ID_from_app_role_blade>"
        ... (add a line per app role)
   }
}   
```

#### App Setup
Similar to API Setup, most changes needed are within the environment.ts file. This application
uses a environment.local.ts file that is not included in the project. First,
create this file within the same DIR as environment.ts (or use environment.ts) (replace <> including the < & >)
1) Update/add this configuration:
```
  AzureAd: {
    clientId: '<client_id_from_app_registration>',
    authority: 'https://login.microsoftonline.com/<directory_(tenant)_id_from_app_registration>',
    redirectUri: 'https://localhost:4200',
    groupId: '<object_id_of_group_whose_members_can_be_managed>',
    enterpriseAppId: '<object_id_of_enterprise_application>'
  }
```
2) Update app.module.ts:
    1) Locate `protectedResourceMap` and replace the `['https://api.exampleauth.tkov.dev/API.Read']`
    with the full URL that was created when exposing an API in step #4.i

### Delegated Administration
The delegated administration page uses Microsoft Graph directly from the Angular application with the signed-in user's delegated permissions. It lists members of the configured group, displays app roles and assignments for the Enterprise Application, and allows an administrator to assign a role to a user.

The page is available at `/administration/delegated` and requires the `User.Administrator` app role. The Graph client first attempts silent token acquisition and requests consent interactively when needed. The `groupId` and `enterpriseAppId` values in the Angular environment identify the group used to list users and the Enterprise Application receiving role assignments.

The current remove action deletes the app-role assignments returned by Microsoft Graph for the selected user.

## Summary
### Notes & Considerations
- This example utilizes 1 app registration and 1 enterprise application. 
While it may be possible to implement 1 app regis. & e-app for the front-end & API separately,
  this was not tested.
    
- the `role.guard.ts` file will read in route data provided in the 
`expectedRole` array defined on a per route basis. These roles must match 
  the role <b>values</b> defined in Azure's App Role blade.
  
- Since this authorization relies on the ID Token & Access Tokens, it is possible
access is revoked for the user, but they are able to still access that part of the app until their
  token is revoked (which occurs based on the refresh timeout of the token set by Azure).
  
### Future Enhancement Opportunities
- Test the ability to define two app registration & e-apps with roles.
- Determine ability to revoke authorization in real-time (not waiting for logout or token refresh).
