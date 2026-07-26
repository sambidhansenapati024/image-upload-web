import { DocumentationTopic } from "../shared/modal/DocumentationTopic";


export const DOCUMENTATION_TOPICS: DocumentationTopic[] = [

    {
        id: 'getting-started',

        title: 'Getting Started',

        description: 'Learn the basics of CloudVault and get up and running quickly.',

        sections: [

            {
                heading: 'Welcome',

                content: `CloudVault is a secure cloud storage platform that allows you to upload, organize and manage your files from anywhere.`
            },

            {
                heading: 'Quick Start',

                content: `1. Create your CloudVault account.
2. Upload your first file.
3. Organize files into folders.
4. Manage your profile.
5. Secure your account.`
            }

        ]
    },

    {
        id: 'dashboard',

        title: 'Dashboard',

        description: 'Overview of your CloudVault account.',

        sections: [

            {
                heading: 'Dashboard Overview',

                content: `The dashboard provides an overview of your storage usage, uploaded files and recent activity.`
            }

        ]
    },

    {
        id: 'upload',

        title: 'File Upload',

        description: 'Upload files securely.',

        sections: [

            {
                heading: 'Uploading Files',

                content: `Click the Upload button and choose one or more files from your computer.`
            }

        ]
    },

    {
        id: 'gallery',

        title: 'Gallery',

        description: 'Browse and preview uploaded files.',

        sections: [

            {
                heading: 'Gallery',

                content: `The Gallery displays all uploaded files with preview support for supported formats.`
            }

        ]
    },

    {
        id: 'profile',

        title: 'Profile',

        description: 'Manage your personal information.',

        sections: [

            {
                heading: 'Profile',

                content: `Update your name, avatar, phone number and country from the Profile page.`
            }

        ]
    },

    {
        id: 'settings',

        title: 'Settings',

        description: 'Customize your CloudVault experience.',

        sections: [

            {
                heading: 'Settings',

                content: `Manage account preferences, storage information and application settings.`
            }

        ]
    },

    {
        id: 'security',

        title: 'Security',

        description: 'Protect your account.',

        sections: [

            {
                heading: 'Security',

                content: `Change your password, manage active sessions and configure additional security features.`
            }

        ]
    },

    {
        id: 'help-center',

        title: 'Help Center',

        description: 'Find answers and get support.',

        sections: [

            {
                heading: 'Help',

                content: `Browse documentation, FAQs and contact support if you need assistance.`
            }

        ]
    }

];