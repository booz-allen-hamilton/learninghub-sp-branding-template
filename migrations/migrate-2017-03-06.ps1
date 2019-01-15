Param(
[Parameter(Mandatory=$true)]
[string]$source = "",
[string]$sourceusername = "sunny@oldrivercreative.com",
[string]$sourcepassword = "5unnyDay!",
[string]$destination = "",
[string]$destinationusername = "liamcleary@shareplicity.com",
[string]$destinationpassword = "qAEtmekTnGH&FL9E",
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

# Convert plaintext passwords to secure passwords for connecting to SharePoint
$securesourcepassword = $sourcepassword | ConvertTo-SecureString -AsPlainText -Force
$securedestinationpassword = $destinationpassword | ConvertTo-SecureString -AsPlainText -Force

Write-Host "Starting Synchronization from: " + $source + " to: " + $destination -foreground "blue"

# Connect to source SharePoint Online
Connect-SPOnline -Url $source -Credentials (Get-Credentials)
Write-Host "Connected to SharePoint Online: " + $source -foreground "yellow"

# Export Taxonomy terms and termsets from source
Write-Host "Exporting taxonomy terms and termsets from: " + $source -foreground "red"
Export-PnPTaxonomy -IncludeID -Path join-path $location, $taxonomyfilename
Write-Host "Completed exporting terms and termset from: " + $source -foreground "green"

# Export provisioning file source
Write-Host "Exporting provisioning template from: " + $source -foreground "red"
if($handlers) {
  Get-PnPProvisioningTemplate -Out $path -Handlers $handlers -IncludeAllTermGroups -IncludeSiteCollectionTermGroup -IncludeSiteGroups -IncludeTermGroupsSecurity -IncludeSearchConfiguration -PersistBrandingFiles -PersistPublishingFiles -IncludeNativePublishingFiles -Force
}
else
{
  Get-PnPProvisioningTemplate -Out $path -IncludeAllTermGroups -IncludeSiteCollectionTermGroup -IncludeSiteGroups -IncludeTermGroupsSecurity -IncludeSearchConfiguration -PersistBrandingFiles -PersistPublishingFiles -IncludeNativePublishingFiles -Force
}
Write-Host "Completed exporting from: " + $source -foreground "green"

# Connect to destination SharePoint Online
Connect-SPOnline -Url $destination -Credentials (Get-Credentials)
Write-Host "Connected to SharePoint Online: " + $destination -foreground "yellow"

# Import Taxonomy terms and termsets into destination
Write-Host "Importing taxonomy terms and termsets from: " + $destination -foreground "red"
Import-PnPTaxonomy -Path join-path $location, $taxonomyfilename
Write-Host "Completed importing terms and termset from: " + $destination -foreground "green"

# Import previously exported provisioning file into destination
Write-Host "Importing provisioning template for: " + $destination -foreground "red"
if($handlers)
{
	Apply-PnPProvisioningTemplate -Path $path -Handlers $handlers
}
else
{
	Apply-PnPProvisioningTemplate -Path $path
}
Write-Host "Completed importing provisioning tmplate for: " + $destination -foreground "green"

Write-Host "Completed Synchronization from: " + $source + " to: " + $destination -foreground "blue"
