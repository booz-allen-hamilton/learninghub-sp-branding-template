Param(
[Parameter(Mandatory=$true)]
[string]$source,
[string]$location = "C:\temp\",
[string]$filename = "Export.pnp"
[string]$taxonomyfilename = "TaxonomyExport.pnp"
[Parameter(Mandatory=$false)]
[string]$handlers = ""
)

# Handlers can be any of the following values:
# RegionalSettings, SupportedUILanguage, AuditSettings, SitePolicy, SiteSecurity,
# TermGroups, Fields, ContentTypes, Lists, CustomActions, Features,
# ComposedLook, SearchSettings, Files, Pages, PageContents,
# PropertyBagEntries, Publishing, Workflows, WebSettings, Navigation
# Handlers will also export any dependencies

# Connect to SharePoint Online
Connect-SPOnline -Url $source -Credentials (Get-Credentials)
Write-Host "Connected to SharePoint Online: " + $source -foreground "yellow"

# Export Taxonomy terms and termsets
Write-Host "Exporting taxonomy terms and termsets from: " + $source -foreground "red"
Export-PnPTaxonomy -IncludeID -Path join-path $location, $taxonomyfilename
Write-Host "Completed exporting terms and termset from: " + $source -foreground "green"

# Get the existing Template from existing Site Collection (Site Url)
Write-Host "Exporting provisioning template from: " + $destination -foreground "red"
Get-PnPProvisioningTemplate -Out join-path $location, $filename -Handlers $handlers
Write-Host "Completed exporting from: " + $destination -foreground "green"
