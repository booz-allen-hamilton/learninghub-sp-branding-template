<%@ Page language="C#" Inherits="Microsoft.SharePoint.Publishing.PublishingLayoutPage,Microsoft.SharePoint.Publishing,Version=16.0.0.0,Culture=neutral,PublicKeyToken=71e9bce111e9429c" %>
<%@ Register Tagprefix="SharePoint" Namespace="Microsoft.SharePoint.WebControls" Assembly="Microsoft.SharePoint, Version=16.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %>
<%@ Register Tagprefix="WebPartPages" Namespace="Microsoft.SharePoint.WebPartPages" Assembly="Microsoft.SharePoint, Version=16.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %>
<%@ Register Tagprefix="PublishingWebControls" Namespace="Microsoft.SharePoint.Publishing.WebControls" Assembly="Microsoft.SharePoint.Publishing, Version=16.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %>
<%@ Register Tagprefix="PublishingNavigation" Namespace="Microsoft.SharePoint.Publishing.Navigation" Assembly="Microsoft.SharePoint.Publishing, Version=16.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %>
<%@ Register tagprefix="Taxonomy" namespace="Microsoft.SharePoint.Taxonomy" assembly="Microsoft.SharePoint.Taxonomy, Version=16.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %>

<asp:Content ContentPlaceholderID="PlaceHolderPageTitle" runat="server">
  <SharePoint:FieldValue FieldName="SeoBrowserTitle" runat="server"/>
</asp:Content>

<asp:Content ContentPlaceholderID="PlaceHolderAdditionalPageHead" runat="server">
<SharePoint:CssRegistration name="<% $SPUrl:~sitecollection/_catalogs/masterpage/bah-ld/css/wide.css %>" runat="server"/>
<SharePoint:CssRegistration name="<% $SPUrl:~sitecollection/_catalogs/masterpage/bah-ld/css/fluid.css %>" runat="server"/>
</asp:Content>

<asp:Content ContentPlaceholderID="PlaceHolderPageTitleInTitleArea" runat="server"/>
<asp:Content ContentPlaceholderID="PlaceHolderLeftNavBar" runat="server"/>

<asp:Content ContentPlaceholderID="PlaceHolderHero" runat="server">
  <div class="hero-container">
    <div class="hero-image"><SharePoint:FieldValue FieldName="HeroImage" runat="server"/></div>
    <div class="hero-text">
      <span class="hero-text-pluses">
        <span class="hero-text-content">
          <SharePoint:FieldValue FieldName="Title" runat="server"/>
        </span>
      </span>
    </div>
  </div>
</asp:Content>

<asp:Content ContentPlaceholderID="PlaceHolderGreyBar" runat="server">
  <div class="grey-container">
    <div class="container">
      <div class="grey-bar-text">
        <PublishingWebControls:RichHtmlField FieldName="GreyBarText" HasInitialFocus="false" MinimumEditHeight="200px" runat="server"/>
      </div>
      <div class="grey-bar-zone">
        <WebPartPages:WebPartZone id="GreyZone" runat="server" title="Grey Zone"/>
      </div>
    </div>
  </div>
</asp:Content>

<asp:Content ContentPlaceholderID="PlaceHolderMain" runat="server">

  <div class="page-content">
    <PublishingWebControls:RichHtmlField FieldName="PublishingPageContent" HasInitialFocus="false" MinimumEditHeight="200px" runat="server"/>
  </div>

  <div class="row">
    <div class="col-xs-12">
      <WebPartPages:WebPartZone id="Zone1" runat="server" title="Zone 1"/>
    </div>
  </div>

  <div class="row">
    <div class="col-sm-6">
      <WebPartPages:WebPartZone id="Zone2" runat="server" title="Zone 2"/>
    </div>
    <div class="col-sm-6">
      <WebPartPages:WebPartZone id="Zone3" runat="server" title="Zone 3"/>
    </div>
  </div>

  <div class="row">
    <div class="col-xs-12">
      <WebPartPages:WebPartZone id="Zone4" runat="server" title="Zone 4"/>
    </div>
  </div>

  <div class="row">
    <div class="col-sm-4">
      <WebPartPages:WebPartZone id="Zone5" runat="server" title="Zone 5"/>
    </div>
    <div class="col-sm-4">
      <WebPartPages:WebPartZone id="Zone6" runat="server" title="Zone 6"/>
    </div>
    <div class="col-sm-4">
      <WebPartPages:WebPartZone id="Zone7" runat="server" title="Zone 7"/>
    </div>
  </div>

  <div class="row">
    <div class="col-xs-12">
      <WebPartPages:WebPartZone id="Zone8" runat="server" title="Zone 8"/>
    </div>
  </div>

  <%-- page settings --%>
  <PublishingWebControls:EditModePanel CssClass="edit-mode-panel" runat="server">
    <h5>Page Settings</h5>
    <SharePoint:TextField FieldName="Title" runat="server" InputFieldLabel="Page Title"/>
    <PublishingWebControls:RichImageField FieldName="HeroImage" runat="server" InputFieldLabel="Hero Image"/>
    <hr>
    <h5>SEO Settings</h5>
    <SharePoint:TextField FieldName="SeoBrowserTitle" runat="server"/>
  </PublishingWebControls:EditModePanel>
  <%-- /page settings --%>

</asp:Content>
