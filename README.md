## Export Layer for Android

A Javascript for Adobe Photoshop, that exports the currently selected layer
to PNG files appropriate for use as Android 'drawable' assets.

This script started as the 'Export for iOS' script, found at <http://pastebin.com/12dHWYm8>

I modified the iOS script to instead export the appropriate image sizes for Android.
   
This script is intended to be used on a photoshop document containing _mdpi_ artwork for Android. It will resize, trim and save the selected layer or group, into a 
directory you select using the layer name (normalised) for the file name. There are a  
couple of resizing options you can select such as the
resizing method and whether to scale styles or not. It does not alter your original
document in any way.

Images are saved to _drawable-mdpi_, _drawable-hdpi_, _drawable-xhdpi_ and _drawable-xxhdpi_ 
directories under the selected output directory. If these directories do not exist, 
the script will create them.
 
Original 'license':
> Feel free to share/reuse/modify to your heart's content. 
>Attribution would be nice but is not required.

To install this script, copy it to your Photoshop installation directory's 
Presets/Scripts directory, and then re-start Photoshop if it is running.

To run the script, select the layer that you want to export, and then choose the
Export Layer for Android option from PhotoShop's File -> Scripts menu.
