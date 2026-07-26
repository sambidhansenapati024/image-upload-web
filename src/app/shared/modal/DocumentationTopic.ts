export interface DocumentationSection {

    heading: string;

    content: string;

}

export interface DocumentationTopic {

    id: string;

    title: string;

    description: string;

    sections: DocumentationSection[];

}