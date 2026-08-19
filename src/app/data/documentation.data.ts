import { DocumentationTopic } from "../shared/modal/DocumentationTopic";

export const DOCUMENTATION_TOPICS: DocumentationTopic[] = [

    // =========================================================
    // GETTING STARTED
    // =========================================================

    {
        id: 'getting-started',

        title: 'Getting Started',

        description:
            'Learn the basics of CloudVault and get up and running quickly.',

        sections: [

            {
                heading: 'Welcome',

                content: `
CloudVault is a secure cloud storage platform designed to help you store, manage and access your files from anywhere.

After creating an account, you can upload files, browse your gallery, manage deleted files, update your profile and monitor your storage usage.

CloudVault provides a simple interface so you can manage your digital files without complicated configuration.
                `
            },

            {
                heading: 'Creating Your Account',

                content: `
To start using CloudVault, create an account using your email address and a secure password.

After registration, sign in using your credentials. Once authenticated, you will be redirected to your CloudVault dashboard.

Make sure you use a valid email address because your account and security-related communication may be associated with it.
                `
            },

            {
                heading: 'Quick Start',

                content: `
Getting started with CloudVault is simple:

1. Create your CloudVault account.
2. Sign in to your account.
3. Open the Upload page.
4. Select one or more supported files.
5. Start the upload.
6. Open the Gallery to view your uploaded files.
7. Use your Profile page to manage your personal information.
8. Review Security settings to protect your account.

Once your files are uploaded, you can access and manage them from the Gallery.
                `
            },

            {
                heading: 'Navigation',

                content: `
The CloudVault application contains several main areas:

Dashboard
Provides an overview of your account and storage.

Upload
Allows you to upload files to your CloudVault storage.

Gallery
Displays your uploaded files and provides actions such as preview, download and delete.

Recycle Bin
Contains files that have been deleted and may be restored or permanently removed.

Profile
Allows you to manage your personal information and profile image.

Settings
Contains account, storage, security and preference options.

Help Center
Provides documentation, FAQs and support options.
                `
            }

        ]
    },


    // =========================================================
    // DASHBOARD
    // =========================================================

    {
        id: 'dashboard',

        title: 'Dashboard',

        description:
            'Get an overview of your CloudVault account and storage.',

        sections: [

            {
                heading: 'Dashboard Overview',

                content: `
The Dashboard provides a quick overview of your CloudVault account.

It can be used to understand your current storage usage, number of uploaded files and other account information.

The dashboard is designed to give you important information without requiring you to navigate through multiple pages.
                `
            },

            {
                heading: 'Storage Overview',

                content: `
The storage section shows how much storage you are currently using compared with your available storage limit.

For example:

1.2 GB / 5 GB

This means 1.2 GB of your available 5 GB storage is currently being used.

The progress indicator provides a visual representation of your storage consumption.
                `
            },

            {
                heading: 'Recent Activity',

                content: `
Recent activity can help you understand what has recently happened in your CloudVault account.

Depending on the features enabled in your account, this may include file uploads, file management operations and other account activity.
                `
            }

        ]
    },


    // =========================================================
    // FILE UPLOAD
    // =========================================================

    {
        id: 'upload',

        title: 'File Upload',

        description:
            'Upload files securely to your CloudVault storage.',

        sections: [

            {
                heading: 'Uploading Files',

                content: `
Open the Upload page to begin uploading files.

You can either drag and drop files into the upload area or click the Browse Files button to select files from your computer.

Multiple files can be added to the upload queue before starting the upload.
                `
            },

            {
                heading: 'Supported Images',

                content: `
CloudVault currently supports common image formats including:

• JPG
• JPEG
• PNG
• WEBP

Files that do not match the supported image formats may be rejected before they are added to the upload queue.
                `
            },

            {
                heading: 'File Size Limit',

                content: `
The current image upload limit is 10 MB per file.

If a selected image exceeds the allowed size, CloudVault will display a warning and the file will not be added to the upload queue.

Make sure your files are within the allowed size before uploading them.
                `
            },

            {
                heading: 'Upload Queue',

                content: `
Files selected for upload are displayed in an upload queue.

Each queue item can display:

• File name
• File size
• Image preview
• Upload progress
• Uploaded amount
• Upload speed
• Estimated remaining time
• Upload status

Files are uploaded individually and the next file starts after the previous upload completes.
                `
            },

            {
                heading: 'Upload Status',

                content: `
Each file can have one of several states.

Uploading
The file is currently being transferred.

Uploaded
The file has been successfully uploaded.

Failed
The upload could not be completed.

Failed uploads can be retried using the retry action.
                `
            },

            {
                heading: 'Upload Completion',

                content: `
After all files in the queue have been successfully uploaded, CloudVault displays an upload completion message.

You can then choose to:

• View Gallery
• Upload More

The Gallery allows you to immediately access your newly uploaded files.
                `
            }

        ]
    },


    // =========================================================
    // GALLERY
    // =========================================================

    {
        id: 'gallery',

        title: 'Gallery',

        description:
            'Browse, preview and manage your uploaded files.',

        sections: [

            {
                heading: 'Gallery Overview',

                content: `
The Gallery displays the files that you have uploaded to CloudVault.

Each file is represented by a card containing its preview, file name, file size and upload information.

The Gallery provides a central location for managing your uploaded images.
                `
            },

            {
                heading: 'Search Files',

                content: `
Use the search field to quickly find files in your Gallery.

Enter part or all of the file name and the Gallery will filter the available results.

Search is useful when your account contains a large number of uploaded files.
                `
            },

            {
                heading: 'Sorting',

                content: `
The Gallery provides sorting options that allow you to organize the displayed files.

Depending on the available options, files can be sorted according to information such as name, upload time or file size.
                `
            },

            {
                heading: 'Previewing an Image',

                content: `
Click the preview action on an image card to open the image viewer.

The full-screen viewer allows you to inspect the image at a larger size.

You can navigate between available images using the viewer navigation controls.
                `
            },

            {
                heading: 'Downloading Files',

                content: `
Use the Download action to download an uploaded file.

The downloaded file is retrieved from CloudVault storage and saved to your device according to your browser's download settings.
                `
            },

            {
                heading: 'Deleting Files',

                content: `
When you delete an image from the Gallery, it is moved to the Recycle Bin instead of being immediately permanently removed.

This provides an opportunity to restore the file if it was deleted accidentally.
                `
            },

            {
                heading: 'Pagination',

                content: `
The Gallery uses pagination when there are many files.

Use the pagination controls at the bottom of the page to move between pages and select how many files should be displayed at a time.
                `
            }

        ]
    },


    // =========================================================
    // RECYCLE BIN
    // =========================================================

    {
        id: 'recycle-bin',

        title: 'Recycle Bin',

        description:
            'Restore deleted files or permanently remove them.',

        sections: [

            {
                heading: 'Recycle Bin Overview',

                content: `
The Recycle Bin contains files that have been deleted from your Gallery.

Deleted files remain available in the Recycle Bin until they are restored or permanently deleted.
                `
            },

            {
                heading: 'Restore Files',

                content: `
If you accidentally delete a file, open the Recycle Bin and locate the file.

Use the Restore action to return the file to your Gallery.

Restored files become available again in your normal file collection.
                `
            },

            {
                heading: 'Permanent Deletion',

                content: `
The permanent deletion action removes a file from the Recycle Bin.

This action is intended for files that you no longer need.

Before permanently deleting a file, make sure you no longer need it because the operation is irreversible.
                `
            },

            {
                heading: 'Searching Deleted Files',

                content: `
Use the search field to find deleted files by their file name.

This can be useful when the Recycle Bin contains many deleted files.
                `
            }

        ]
    },


    // =========================================================
    // PROFILE
    // =========================================================

    {
        id: 'profile',

        title: 'Profile',

        description:
            'Manage your personal information and profile settings.',

        sections: [

            {
                heading: 'Profile Overview',

                content: `
The Profile page contains information associated with your CloudVault account.

You can view your name, email address, phone number, country and account information from the profile page.
                `
            },

            {
                heading: 'Profile Image',

                content: `
You can upload a profile image from the Profile page.

Select the camera option on your profile avatar and choose an image from your device.

The selected image will be used as your CloudVault profile image.
                `
            },

            {
                heading: 'Editing Your Profile',

                content: `
Use the Edit Profile button to update supported profile information.

Depending on the available fields, you may be able to update:

• Phone number
• Country
• Timezone
• Bio

Save your changes after making the required updates.
                `
            },

            {
                heading: 'Personal Information',

                content: `
The Personal Information section displays important account information such as your full name, email address, phone number and account join date.
                `
            }

        ]
    },


    // =========================================================
    // SETTINGS
    // =========================================================

    {
        id: 'settings',

        title: 'Settings',

        description:
            'Manage your CloudVault account preferences and configuration.',

        sections: [

            {
                heading: 'Settings Overview',

                content: `
The Settings page contains configuration options related to your CloudVault account.

Settings are organized into separate sections so that account, security and preference options are easier to manage.
                `
            },

            {
                heading: 'Account',

                content: `
The Account section provides information about your CloudVault account.

It can include:

• Account email
• Member information
• Storage plan

Your current storage plan is displayed as part of your account information.
                `
            },

            {
                heading: 'Storage',

                content: `
The Storage section provides information about your current storage consumption.

You can view the amount of storage currently being used, your storage limit and your active storage plan.

A progress bar provides a visual representation of your usage.
                `
            },

            {
                heading: 'Preferences',

                content: `
Preferences allow CloudVault to provide configurable application behavior.

Available preference options may include:

• Theme
• Language
• Notifications
• Auto Refresh

Some preference features may be introduced in future versions.
                `
            }

        ]
    },


    // =========================================================
    // SECURITY
    // =========================================================

    {
        id: 'security',

        title: 'Security',

        description:
            'Protect your CloudVault account and manage active sessions.',

        sections: [

            {
                heading: 'Security Overview',

                content: `
Security settings help protect your CloudVault account and provide visibility into account access.

You should use a strong password and regularly review active sessions.
                `
            },

            {
                heading: 'Changing Your Password',

                content: `
Open the Password Security section and select Change Password.

Enter:

1. Your current password.
2. Your new password.
3. Confirmation of your new password.

Make sure the new password meets the required security requirements before submitting the change.
                `
            },

            {
                heading: 'Password Strength',

                content: `
CloudVault provides password strength feedback when creating a new password.

The password indicator can show whether a password is weak, medium or strong.

Using a strong and unique password helps protect your account against unauthorized access.
                `
            },

            {
                heading: 'Active Sessions',

                content: `
The Active Sessions section displays devices that are currently signed in to your CloudVault account.

For each session, information may include:

• Browser
• Operating system
• Device
• Last activity

The current session is identified separately from other active sessions.
                `
            },

            {
                heading: 'Sign Out Other Devices',

                content: `
If you notice an unfamiliar device or simply want to end other active sessions, use the Sign Out All Other Devices action.

You can also sign out an individual session separately.

Review your active sessions regularly if you use CloudVault across multiple devices.
                `
            },

            {
                heading: 'Two-Factor Authentication',

                content: `
Two-factor authentication provides an additional layer of account security.

The CloudVault interface includes a Two-Factor Authentication section where this feature can be provided when available.

Additional authentication options may be introduced in future versions.
                `
            }

        ]
    },


    // =========================================================
    // HELP CENTER
    // =========================================================

    {
        id: 'help-center',

        title: 'Help Center',

        description:
            'Find answers, explore documentation and get support.',

        sections: [

            {
                heading: 'Help Center Overview',

                content: `
The CloudVault Help Center provides resources to help you understand and use the application.

You can browse documentation, review frequently asked questions or contact the support team when additional assistance is required.
                `
            },

            {
                heading: 'Documentation',

                content: `
The Documentation section contains guides covering important CloudVault features.

Topics include:

• Getting Started
• Dashboard
• File Upload
• Gallery
• Profile
• Settings
• Security
• Help Center

Use the documentation navigation to move between topics.
                `
            },

            {
                heading: 'Frequently Asked Questions',

                content: `
The FAQ section provides quick answers to common questions about CloudVault.

Common topics include supported file types, upload limits, password management and account security.
                `
            },

            {
                heading: 'Contact Support',

                content: `
If you cannot find an answer in the documentation or FAQ section, you can contact CloudVault support.

When submitting a support request, provide as much relevant information as possible so the support team can understand and resolve your issue efficiently.
                `
            },

            {
                heading: 'Tracking Support Queries',

                content: `
After submitting a support query, you can track its progress from My Support Queries.

A support query may move through different stages such as:

• Raised
• Received
• Assistant Assigned
• In Progress
• Completed
• Closed

The tracking timeline provides information about the progress of your request.
                `
            }

        ]
    }

];