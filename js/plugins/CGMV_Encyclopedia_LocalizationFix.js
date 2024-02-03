var Localization_CGMV_Window_EncyclopediaDisplay_drawCustomDescription = CGMV_Window_EncyclopediaDisplay.prototype.drawCustomDescription;
CGMV_Window_EncyclopediaDisplay.prototype.drawCustomDescription = function(description) {
    description = DKTools.Localization.getText(description);
    return Localization_CGMV_Window_EncyclopediaDisplay_drawCustomDescription.call(this, description);
};