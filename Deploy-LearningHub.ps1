Param (
    [Parameter(Mandatory = $True)]
    [string]$site,

    [Parameter(Mandatory = $True)]
    [string]$username,

    [Parameter(Mandatory = $True)]
    [string]$pword,

    [Parameter(Mandatory = $False)]
    [string]$pathprefix = "",

    [Parameter(Mandatory = $False)]
    [string]$rootSite = "/sites/ld/"
)

$ErrorActionPreference = "Stop"

$url = "$($site)$($rootSite)"
# $pageTitle = "Booz Allen Gifts & Business Courtesies Portal"
$password = ConvertTo-SecureString -String $pword -AsPlainText -Force
$credentials = New-Object -TypeName System.Management.Automation.PSCredential -ArgumentList $username, $password

function UploadDocuments()
{
    Param(
        [ValidateScript( {If (Test-Path $_) {$true}else {Throw "Invalid path given: $_"}})]
        $LocalFolderLocation,
        [String]
        $documentLibraryName
    )
    Process
    {

        $path = $LocalFolderLocation.TrimEnd('\')

        try
        {
            $file = Get-ChildItem -Path $path -Recurse
            $i = 0;
            (Get-ChildItem $path -Recurse) | ForEach-Object {
                try
                {
                    $i++
                    if ($_.GetType().Name -eq "FileInfo")
                    {
                        $SPFolderName = $documentLibraryName + $_.DirectoryName.Substring($path.Length);
                        $status = "Uploading Files :'" + $_.Name + "' to Location :" + $SPFolderName
                        Write-Progress -Activity "Uploading Documents.." -Status $status -PercentComplete (($i / $file.length) * 100)

                        Add-PnPFile -Path $_.FullName -Folder $SPFolderName -Checkout
                    }
                }
                catch
                {
                }
            }

            Write-Progress -Activity "Uploading Documents.." -Status "Ready" -Completed
        }
        catch
        {
            Write-Host $_.Exception.Message -ForegroundColor Red
        }

    }
}

Connect-PnpOnline -Url $url -Credentials $credentials

$path = (Get-Location).Path
if ($pathprefix -ne "")
{
    $path = "$($path)\$($pathprefix)"
}

# Upload Master Page
Write-Host "Uploading masterpage..."
$masterPagePath = "$($path)\_catalogs\masterpage\bah-ld\bah-ld.master"
((Get-Content -path $masterPagePath) -replace '{rootSite}', $rootSite) | Set-Content -Path $masterPagePath
Add-PnPFile -Path $masterPagePath -Folder "_catalogs/masterpage/bah-ld"

# Upload Home Carousel Page Layout
Write-Host "Uploading home carousel page layout..."
$masterPagePath = "$($path)\_catalogs\masterpage\bah-ld\bah-ld-home-carousel.aspx"
((Get-Content -path $masterPagePath) -replace '{rootSite}', $rootSite) | Set-Content -Path $masterPagePath
Add-PnPFile -Path $masterPagePath -Folder "_catalogs/masterpage/bah-ld"

# Upload Home Page Layout
Write-Host "Uploading home page layout..."
$masterPagePath = "$($path)\_catalogs\masterpage\bah-ld\bah-ld-home.aspx"
((Get-Content -path $masterPagePath) -replace '{rootSite}', $rootSite) | Set-Content -Path $masterPagePath
Add-PnPFile -Path $masterPagePath -Folder "_catalogs/masterpage/bah-ld"

# Upload Left Sidebar Page Layout
Write-Host "Uploading left sidebar page layout..."
$masterPagePath = "$($path)\_catalogs\masterpage\bah-ld\bah-ld-left-sidebar.aspx"
((Get-Content -path $masterPagePath) -replace '{rootSite}', $rootSite) | Set-Content -Path $masterPagePath
Add-PnPFile -Path $masterPagePath -Folder "_catalogs/masterpage/bah-ld"

# Upload Right Sidebar Page Layout
Write-Host "Uploading right sidebar page layout..."
$masterPagePath = "$($path)\_catalogs\masterpage\bah-ld\bah-ld-right-sidebar.aspx"
((Get-Content -path $masterPagePath) -replace '{rootSite}', $rootSite) | Set-Content -Path $masterPagePath
Add-PnPFile -Path $masterPagePath -Folder "_catalogs/masterpage/bah-ld"

# Upload Wide Fluid Page Layout
Write-Host "Uploading wide fluid page layout..."
$masterPagePath = "$($path)\_catalogs\masterpage\bah-ld\bah-ld-wide-fluid.aspx"
((Get-Content -path $masterPagePath) -replace '{rootSite}', $rootSite) | Set-Content -Path $masterPagePath
Add-PnPFile -Path $masterPagePath -Folder "_catalogs/masterpage/bah-ld"

# Upload Wide Page Layout
Write-Host "Uploading wide page layout..."
$masterPagePath = "$($path)\_catalogs\masterpage\bah-ld\bah-ld-wide.aspx"
((Get-Content -path $masterPagePath) -replace '{rootSite}', $rootSite) | Set-Content -Path $masterPagePath
Add-PnPFile -Path $masterPagePath -Folder "_catalogs/masterpage/bah-ld"

# Upload Style Files
Write-Host "Uploading style files..."
UploadDocuments -LocalFolderLocation "$($path)\_catalogs\masterpage\bah-ld\css" -documentLibraryName "_catalogs/masterpage/bah-ld/css"

# Upload Display Template Files
Write-Host "Uploading display templates files..."
UploadDocuments -LocalFolderLocation "$($path)\_catalogs\masterpage\bah-ld\display-templates" -documentLibraryName "_catalogs/masterpage/bah-ld/display-templates"

# Upload Font Files
Write-Host "Uploading font files..."
UploadDocuments -LocalFolderLocation "$($path)\_catalogs\masterpage\bah-ld\fonts" -documentLibraryName "_catalogs/masterpage/bah-ld/fonts"

# Upload Image Files
Write-Host "Uploading image files..."
UploadDocuments -LocalFolderLocation "$($path)\_catalogs\masterpage\bah-ld\img" -documentLibraryName "_catalogs/masterpage/bah-ld/img"

# Upload Image Files
Write-Host "Uploading javascript files..."
UploadDocuments -LocalFolderLocation "$($path)\_catalogs\masterpage\bah-ld\js" -documentLibraryName "_catalogs/masterpage/bah-ld/js"

# Upload Webpart Maifest Files
Write-Host "Uploading webpart manifest files..."
UploadDocuments -LocalFolderLocation "$($path)\_catalogs\masterpage\bah-ld\wp" -documentLibraryName "_catalogs/masterpage/bah-ld/wp"

$portalSubWebs = Get-PnPSubWebs
$portalWeb = $null

Write-Host "Checking if subsite exists..."
if ($portalSubWebs -is [array])
{
    foreach ($subWeb in $portalSubWebs)
    {
        if ($subWeb.Title -eq "Learning Hub Dev Site")
        {
            $giftPortalWeb = $subWeb
            Write-Host "Learning Hub Dev Subsite exists!"
        }
    }
}
else
{
    if ($portalSubWebs.Title -eq "Learning Hub Dev Site")
    {
        $portalWeb = $portalSubWebs
    }
}

if ($null -eq $portalWeb)
{
    # Create subsite
    Write-Host "Learning Hub Dev Site does not exist, creating..."
    $giftPortalWeb = New-PnPWeb -Title "Learning Hub Dev Site" -Url "ld-dev" -Template "STS#0"
}

# Connect to GiftPortal Subsite
Write-Host "Connecting to Learning Hub Dev Subsite..."
Connect-PnPOnline -Url $portalWeb.Url -Credentials $credentials

# Enable Publishing Feature
Write-Host "Enabling Publishing Feature..."
$feature = Get-PnPFeature -Identity 94c94ca6-b32f-4da9-a9e3-1f3d343d7ecb -Scope Web
if ($null -eq $feature.ServerObjectIsNull)
{
    Enable-PnPFeature -Identity 94c94ca6-b32f-4da9-a9e3-1f3d343d7ecb -Scope Web
}

# Set Master Page
Write-Host "Setting Masterpage..."
Set-PnPMasterPage -CustomMasterPageServerRelativeUrl "$($rootSite)_catalogs/masterpage/bah-ld/bah-ld.master"


<#
## TODO: NEED TO UPDATE THIS SO CONTENT TYPES ARE ADDED AND PROPER PAGE TEMPLATE IS SET FOR HOME PAGE AND PROPER WEBPARTS ARE DEPLOYED TO PAGE 

# Add Gift Portal Home Page
Write-Host "Adding GiftGiving.aspx..."
try
{
    Get-PnPFile -Url "$($rootSite)giftportal/Pages/GiftGiving.aspx"
}
catch
{
    Add-PnPPublishingPage -PageName "GiftGiving" -Title $pageTitle -PageTemplateName "BlankWebPartPage"
}

Set-PnPFileCheckedOut -Url "$($rootSite)giftportal/Pages/GiftGiving.aspx"

# Add Script Editor Web Part to Gift Portal Page
Write-Host "Adding Script Editor Web Part to Gift Portal Home Page..."
$snippet = Get-Content "$($path)\Snippets\GiftGiving.html" -Raw
$webPart = Get-PnPWebPart -ServerRelativePageUrl "Pages/GiftGiving.aspx" -Identity "Script Editor"
$webPartId = $null

if ($null -eq $webPart.Id)
{
    # Add the script editor web part
    Write-Host "Adding script editor web part to GiftGiving.aspx..."
    Add-PnPWebPartToWebPartPage -ServerRelativePageUrl "Pages/GiftGiving.aspx" -Path "$($path)\Snippets\ScriptEditor.webpart" -ZoneId "Header" -ZoneIndex 0
    $webPart = Get-PnPWebPart -ServerRelativePageUrl "Pages/GiftGiving.aspx" -Identity "Script Editor"
    $webPartId = $webPart.Id
}
else
{
    $webPartId = $webPart.Id
}

Set-PnPWebPartProperty -ServerRelativePageUrl "Pages/GiftGiving.aspx" -Identity $webPartId -Key "Content" -Value $snippet
Set-PnPFileCheckedIn -Url "$($rootSite)giftportal/Pages/GiftGiving.aspx"

# Set GiftGiving.aspx as Welcome Page
Write-Host "Setting GiftGiving.aspx as Welcome Page..."
Set-PnPHomePage -RootFolderRelativeUrl "Pages/GiftGiving.aspx"

# Set Ethics First logo
Write-Host "Setting Gift Portal logo..."
Set-PnPWeb -SiteLogoUrl "$($rootSite)Style library/bah/css/images/EthicsFirst.png"

# Set QuickLaunch Navigation
Write-Host "Setting QuickLaunch Navigation..."
Get-PnPNavigationNode -Location QuickLaunch | ForEach-Object {
    Remove-PnPNavigationNode -Identity $_.Id -Force
}

$navNode = Add-PnPNavigationNode -Title "Booz Allen Gift Policy" -Url "https://boozallen.sharepoint.com/sites/policies/Shared%20Documents/Gift%20and%20Business%20Courtesies%20Policy.pdf" -Location QuickLaunch
$navNode = Add-PnPNavigationNode -Title "Contact Ethics & Compliance" -Url "mailto:ethics@bah.com" -Location QuickLaunch
#>


<# Expected script output:
Uploading MasterPage...
Uploading Style Library documents...
Checking if Gift Portal subsite exists...
GiftPortal subsite does not exist, creating...
Connecting to GiftPortal Subsite...
Enabling Publishing Feature...
Setting Masterpage...
Adding GiftGiving.aspx...
Adding Script Editor Web Part to Gift Portal Home Page...
Adding script editor web part to GiftGiving.aspx...
Setting GiftGiving.aspx as Welcome Page...
Setting Gift Portal logo...
Setting QuickLaunch Navigation...
#>
