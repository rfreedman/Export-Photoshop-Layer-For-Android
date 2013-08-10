/**
 * Export for Android Photoshop Script
 *
 * Author: Rich Freedman (greybeardedgeek.net)
 * GitHub: https://github.com/rfreedman
 * Twitter: @greybeardedgeek
 * 
 * This script started as the 'Export for iOS' script, found at http://pastebin.com/12dHWYm8, 
 * and originally authored by Daniel Wood ( twitter: @loadedwino )
 *
 * I modified the iOS script to instead export the appropriate image sizes for Android.
 *  
 * This script is intended to be used on a photoshop document containing mdpi
 * artwork for Android. It will resize, trim and save the selected layer or group, into a 
 * directory you select using the layer name (normalised) for the file name. There are a  
 * couple of resizing options you can select such as the
 * resizing method and whether to scale styles or not. It does not alter your original
 * document in anyway.
 *
 * Images are saved to 'drawable-ldpi', 'drawable-mdpi', 'drawable-hdpi', and 'drawable-xhdpi'
 * directories under the selected output directory. If these directories do not exist, 
 * the script will create them.
 * 
 * Original 'license':
 * Feel free to share/reuse/modify to your heart's content. 
 * Attribution would be nice but is not required.
 */
// constants
var ResizeMethod = {
    NEARESTNEIGHBOUR: {name: 'Nearest Neighbour', value: 'Nrst'},
    BILINEAR: {name: 'Bilinear', value: 'Blnr'},
    BICUBIC: {name: 'Bicubic', value: 'Bcbc'},
    BICUBICSMOOTHER: {name: 'Bicubic Smoother', value: 'bicubicSmoother'},
    BICUBICSHARPER: {name: 'Bicubic Sharper', value: 'bicubicSharper'}
};
var resizeMethodLookup = {};
resizeMethodLookup[ResizeMethod.NEARESTNEIGHBOUR.name] = ResizeMethod.NEARESTNEIGHBOUR.value;
resizeMethodLookup[ResizeMethod.BILINEAR.name] = ResizeMethod.BILINEAR.value;
resizeMethodLookup[ResizeMethod.BICUBIC.name] = ResizeMethod.BICUBIC.value;
resizeMethodLookup[ResizeMethod.BICUBICSMOOTHER.name] = ResizeMethod.BICUBICSMOOTHER.value;
resizeMethodLookup[ResizeMethod.BICUBICSHARPER.name] = ResizeMethod.BICUBICSHARPER.value;

var exportDialog;


function savePng(width, resizeMethod, scaleStyles, folderName, normalisedName, dupDoc)
{
    resizeImage(UnitValue(width, "px"), resizeMethod, scaleStyles);
    outputFolder = Folder(folderName);
    if(!outputFolder.exists) outputFolder.create();
    saveForWebPNG(dupDoc, outputFolder.fullName, normalisedName);	
}

function saveForWebPNG(doc, outputFolderStr, filename)
{
    var opts, file;
    opts = new ExportOptionsSaveForWeb();
    opts.format = SaveDocumentType.PNG;
    opts.PNG8 = false;
    opts.quality = 100;
    if (filename.length > 27) {
        file = new File(outputFolderStr + "/temp.png");
        doc.exportDocument(file, ExportType.SAVEFORWEB, opts);
        file.rename(filename + ".png");
    }
    else {
        file = new File(outputFolderStr + "/" + filename + ".png");
        doc.exportDocument(file, ExportType.SAVEFORWEB, opts);
    }
}

function resizeImage(width, method, scaleStyles)
{
    var action = new ActionDescriptor();
    action.putUnitDouble( charIDToTypeID("Wdth"), charIDToTypeID("#Pxl"), width );
    
    if(scaleStyles == true)
        action.putBoolean( stringIDToTypeID("scaleStyles"), true );
    
    action.putBoolean( charIDToTypeID("CnsP"), true );
    action.putEnumerated( charIDToTypeID("Intr"), charIDToTypeID("Intp"), charIDToTypeID(method) );

    executeAction( charIDToTypeID("ImgS"), action, DialogModes.NO );
}

function exportImages(baseName, resizeMethod, scaleStyles)
{
    // select a folder to save to
    var folder = Folder.selectDialog(); 
    if(folder)
    {
        // Save original units
        var originalRulerUnits = app.preferences.rulerUnits ;
        var originalTypeUnits = app.preferences.typeUnits ;

        app.preferences.rulerUnits=Units.PIXELS;
        app.preferences.typeUnits=TypeUnits.PIXELS;


        // get currect document
        var doc = app.activeDocument;

        // create new document based on the current docs values except name which user 
        var dup = app.documents.add(doc.width, doc.height, doc.resolution, baseName, NewDocumentMode.RGB, DocumentFill.TRANSPARENT);

        // switch back to origal doc to allow duplicate
        app.activeDocument = doc;

        // duplicate the selected layer (only works for one) at place it in the new doc
        doc.activeLayer.duplicate(dup);

        // switch back to the new document
        app.activeDocument = dup;

        // trim the document so that all that appears is our element
        dup.trim(TrimType.TRANSPARENT);

        // adjust canvas size so that it is an even number of pixels (so scaling down fits on whole pixel)
        dup.resizeCanvas(Math.ceil(dup.width/2)*2, Math.ceil(dup.height/2)*2, AnchorPosition.TOPLEFT);
        
        // normalise name (basic normalisation lower case and hyphenated, modify or remove to taste)
        var normalisedName = dup.name.toLowerCase().replace(' ', '-');
        
        // we assume that the original image is at mdpi size, so we'll scale as needed from there
        var mdpiWidth = dup.width;  
        
        var ldpiWidth = mdpiWidth * 0.75;              
        var hdpiWidth = mdpiWidth * 1.5;
        var xhdpiWidth = mdpiWidth * 2;

        savePng(mdpiWidth,  resizeMethod, scaleStyles, folder.fullName + '/drawable-mdpi',  normalisedName, dup);
        savePng(ldpiWidth,  resizeMethod, scaleStyles, folder.fullName + '/drawable-ldpi',  normalisedName, dup);
        savePng(hdpiWidth,  resizeMethod, scaleStyles, folder.fullName + '/drawable-hdpi',  normalisedName, dup);
        savePng(xhdpiWidth, resizeMethod, scaleStyles, folder.fullName + '/drawable-xhdpi', normalisedName, dup);

        dup.close(SaveOptions.DONOTSAVECHANGES);

        app.preferences.rulerUnits=originalRulerUnits;
        app.preferences.typeUnits=originalTypeUnits;
    }
}

function okClickedHandler()
{
    var resizeMethod = resizeMethodLookup[exportDialog.methodOptions.selection.text];
    var scaleStyles = exportDialog.scaleStylesCheckBox.value;
    var baseName = exportDialog.namePanel.nameBox.text;
    exportDialog.close();
    exportImages(baseName, resizeMethod, scaleStyles);
}

exportDialog = new Window('dialog', 'Export Selected Layer for Android'); 
exportDialog.alignChildren = 'left';

exportDialog.namePanel = exportDialog.add('panel', undefined, 'Base name');
exportDialog.namePanel.alignChildren = 'left';

var doc = app.activeDocument;
var defaultName = doc.activeLayer.name;

exportDialog.namePanel.nameBox = exportDialog.namePanel.add('edittext', undefined, 'Name');
exportDialog.namePanel.nameBox.preferredSize = [160,20];
exportDialog.namePanel.nameBox.text = defaultName;

exportDialog.methodOptions = exportDialog.add('dropdownlist', undefined, [ResizeMethod.NEARESTNEIGHBOUR.name, ResizeMethod.BILINEAR.name, ResizeMethod.BICUBIC.name, ResizeMethod.BICUBICSMOOTHER.name, ResizeMethod.BICUBICSHARPER.name]);
exportDialog.methodOptions.children[1].selected = true;
exportDialog.scaleStylesCheckBox = exportDialog.add('checkbox', undefined, 'Scale Styles');
exportDialog.scaleStylesCheckBox.value = true;

exportDialog.buttonGroup = exportDialog.add('group');
exportDialog.buttonGroup.cancelButton = exportDialog.buttonGroup.add('button', undefined, 'Cancel');
exportDialog.buttonGroup.okButton = exportDialog.buttonGroup.add('button', undefined, 'OK');
exportDialog.buttonGroup.okButton.addEventListener('click', okClickedHandler);
exportDialog.show();
