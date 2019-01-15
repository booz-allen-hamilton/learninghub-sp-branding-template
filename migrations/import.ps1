Param(
[Parameter(Mandatory=$true)]
[string]$destination
[string]$location = "C:\temp\",
[string]$filename = "Export.pnp",
[string]$taxonomyfilename = "TaxonomyExport.pnp"
[Parameter(Mandatory=$false)]
[string]$handlers = "Field,ContentTypes,Lists"
)

# Handlers can be any of the following values:
# RegionalSettings, SupportedUILanguage, AuditSettings, SitePolicy, SiteSecurity,
# TermGroups, Fields, ContentTypes, Lists, CustomActions, Features,
# ComposedLook, SearchSettings, Files, Pages, PageContents,
# PropertyBagEntries, Publishing, Workflows, WebSettings, Navigation
# Handlers will also export any dependencies

# Connect to SharePoint Online
Connect-SPOnline -Url $source -Credentials (Get-Credentials)
Write-Host "Connected to SharePoint Online: " + $destination -foreground "yellow"

# Import Taxonomy terms and termsets
Write-Host "Importing taxonomy terms and termsets from: " + $destination -foreground "red"
Import-PnPTaxonomy -Path join-path $location, $taxonomyfilename
Write-Host "Completed importing terms and termset from: " + $destination -foreground "green"

# Import previously exported provisioning file
Write-Host "Importing provisioning template for: " + $destination -foreground "red"
Apply-PnPProvisioningTemplate -Path join-path $location, $filename -Handlers $handlers
Write-Host "Completed importing provisioning tmplate for: " + $destination -foreground "green"
