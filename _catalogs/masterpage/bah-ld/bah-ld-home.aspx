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
  <SharePoint:CssRegistration name="<% $SPUrl:~sitecollection/_catalogs/masterpage/bah-ld/css/home.css %>" runat="server"/>
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

<asp:Content ContentPlaceholderID="PlaceHolderMain" runat="server">

  <WebPartPages:WebPartZone id="Zone1" runat="server" title="Zone 1"/>

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
