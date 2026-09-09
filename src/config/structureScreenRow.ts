/** Structure section row — merged into the API screen config until deployed. */
export const structureScreenRow = {
    displayType: 'group',
    groupId: 'structure',
    columns: [
        {
            elements: [
                {
                    type: 'pageStructure',
                    value: {
                        parts: '$data#$.Source.PhysDesc.Part',
                        items: '$data#$.Source.ManuscriptDescription.Contents.Item',
                    },
                },
            ],
        },
    ],
} ;
