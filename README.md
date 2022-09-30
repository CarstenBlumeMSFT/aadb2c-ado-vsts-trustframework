# Azure AD B2C Custom Policy Utils
This Azure DevOps extension provides multiple tasks to use with Azure AD B2C custom policies developed through the [Azure AD B2C VS code extension](https://github.com/azure-ad-b2c/vscode-extension#policy-settings).
![New Tasks](media/addTasks.png)

## Azure AD B2C Service Connection
This extension lets you centralize your connection to your Azure AD B2C tenant through a service connection, which you can reference in the upload task.

For more information on the general setup for this scenario, see [Deploy custom policies with Azure Pipelines](https://learn.microsoft.com/en-us/azure/active-directory-b2c/deploy-custom-policies-devops).

The service connection "Azure AD B2C service principal" offers two different options for authenticating your Microsoft Graph application in your Azure AD B2C tenant:
- Client Certificate: Uses a certificate to authenticate towards your Azure AD B2C (should be preferred).
- Client Secret: Uses a symmetric secret to authenticate towards your Azure AD B2C.

You can find the service connection in the dialog to create service connections for your Azure DevOps project:
![New Service Connection](media/newServiceConnection.png)

### Setup for the Service Connection with Client Certificate
![New Service Connection Certificate](media/newServiceConnectionCertificate.png)
| Parameter | Description |
| :-------- | :---------- |
| Tenant | The tenant id of your Azure AD B2C tenant either as an url "onmicrosoft.com" or as a GUID. |
| Client Id | The client id of the Microsoft Graph application you registered in your Azure AD B2C tenant. |
| Client Certificate Thumbprint | The 40-digit thumbprint of the public certificate you uploaded as a client credential for your App Registration as described [here](https://learn.microsoft.com/en-us/azure/active-directory/develop/howto-create-service-principal-portal#option-1-upload-a-certificate).  |
| Client Certificate Key | Then encrypted private key of your certificate in PEM format (should look like: ```-----BEGIN ENCRYPTED PRIVATE KEY-----MIIFHDBOBgkqhki[...]-----END ENCRYPTED PRIVATE KEY-----```. This must start with "BEGIN ENCRYPTED PRIVATE KEY" and may not contain any Bag / Key Attributes before this.) |
| Client Certificate Passphrase | The passphrase to decrypt your private key. |

### Setup for the Service Connection with Client Secret
![New Service Connection Secret](media/newServiceConnectionSecret.png)
| Parameter | Description |
| :-------- | :---------- |
| Tenant | The tenant id of your Azure AD B2C tenant either as an url "onmicrosoft.com" or as a GUID. |
| Client Id | The client id of the Microsoft Graph application you registered in your Azure AD B2C tenant. |
| Client Secret | The symmetric client secret you generated at your App Registration as described [here](https://learn.microsoft.com/en-us/azure/active-directory-b2c/tutorial-register-applications?tabs=app-reg-ga#create-a-client-secret). |

# Task to build all Azure AD B2C custom policies
Use this task to build a set of [Azure AD B2C custom policies](https://docs.microsoft.com/azure/active-directory-b2c/custom-policy-overview) by replacing the settings supplied in an appsettings.json file. This action is implemented to provide the same functionality as the "B2C Build all policies" command of the [Azure AD B2C VS code extension](https://github.com/azure-ad-b2c/vscode-extension#policy-settings).
![B2CBuildAllPolicies](media/taksBuild.png)

## Sample pipeline to build all policies

```yaml
trigger:
- main

pool:
  vmImage: ubuntu-latest

steps:
- task: B2CBuildAllPolicies@0
  inputs:
    policyFolder: './MyPolicyFolder'
    outputFolder: './generatedOutput'
    renumberSteps: true
```

## Parameters for build all policies
| Parameter | Description |
| :-------- | :---------- |
| policyFolder | The input folder for building the policies. The appsettings.json file is expected to be found in this folder. The action will find all XML-files in the folder and its subfolders, whilst automatically ignoring all files in the directory set as "EnvironmentsFolder" in the appsettings.json. |
| outputFolder | The output folder where the processed polcy-files are written. Like when processing through the [Azure AD B2C VS code extension](https://github.com/azure-ad-b2c/vscode-extension#policy-settings) a seperate folder is created for each environment. |
| renumberSteps *(optional)* | true / false - Indicates if steps inside UserJourneys should be renumbered if they're out of sync. *(default: false)* |

# Task to upload all Azure AD B2C custom policies
Use this task to deploy all [Azure AD B2C custom policies](https://docs.microsoft.com/azure/active-directory-b2c/custom-policy-overview) from a folder and its subfolders into your Azure Active Directory B2C tenant using the [Microsoft Graph API](https://docs.microsoft.com/graph/api/resources/trustframeworkpolicy?view=graph-rest-beta). If the policies do not yet exist, they will be created. If the policies already exists, they will be replaced.
![B2CUploadAllPolicies](media/taksUpload.png)

### Sample pipeline to upload all policies

```yaml
trigger:
- main

pool:
  vmImage: ubuntu-latest

steps:
- task: B2CUploadAllPolicies@0
  inputs:
    b2cGraphServicePrincipal: 'Your service connection of type "Azure AD B2C service principal"'
    policyFolder: './MyGeneratedPolicyFolder'
```

### Parameters for upload all policies
| Parameter | Description |
| :-------- | :---------- |
| b2cGraphServicePrincipal | The name of your defined service connection of type "Azure AD B2C service principal" to connect to your Azure AD B2C tenant. |
| policyFolder | The input folder for uploading the policies. The action will find all XML-files in the folder and its subfolders and automatically derive the order of uploading from the inheritance between the files. |
