
export const softwareTemplete = {
  "databases": [
    {
      "name": "metaphlan_database",
      "dataKey": "metaphlan_database",
      "label": "metaphlan_database",
      "rules": [
        {
          "required": true,
          "message": "This field cannot be empty!"
        }
      ],
      "type": "BaseSelect"
    }
  ],
  "upstreamFormJson": [
    {
      "name": "stat_q",
      "data": [
        {
          "label": "0.2",
          "value": 0.2
        },
        {
          "label": "0",
          "value": 0
        }
      ],
      "initialValue": 0.2,
      "label": "Quantile value for the robust average(--stat_q)",
      "rules": [
        {
          "required": true,
          "message": "This field cannot be empty!"
        }
      ],
      "type": "BaseSelect"
    }
  ]
}

export const scriptTemplete = {
  "formJson": [
    {
      "name": "x_input",
      "label": "x input",
      "component_id": "75087620-2ff8-4045-8694-a0c19aac12fc",
      "db": true,
      "group": "group_field",
      "type": "CollectedSampleSelect",
      "columns": [
        "sample_vars",
        "feature_var"
      ],
      "modes": [
        1,
        0
      ],
      "columns_rules": [
        1,
        1
      ],
      "rules": [
        {
          "required": true,
          "message": "This field cannot be empty!"
        }
      ]
    }
  ]
  // "formJson": [
  //   {
  //     "name": "group_field",
  //     "label": "Group Field",
  //     "rules": [
  //       {
  //         "required": true,
  //         "message": "This field cannot be empty!"
  //       }
  //     ],
  //     "type": "GroupFieldSelect"
  //   },
  //   {
  //     "name": "metaphlan_sam_abundance",
  //     "label": "Abundance",
  //     "db":true,
  //     "rules": [
  //       {
  //         "required": true,
  //         "message": "This field cannot be empty!"
  //       }
  //     ],
  //     "type": "GroupSelectSampleButton",
  //     "group": "group_field"
  //   }
  // ]
}

export const fileTemplete = {
  "name": "raw_reads",
  "mode": "multiple",
  "type": "GroupSelectSampleButton",
  "label": "Raw Reads",
  "group": "group_field",
  "rules": [
    {
      "required": true,
      "message": "This field cannot be empty!"
    }
  ],
  "dir": "metaphlan",
  "fileFormat": {
    "profile": "*/*_profile.txt"
  },
  "inputForm": [
    {
      "name": [
        "content",
        "fastq1"
      ],
      "initialValue": "/data/wangyang/NGS_TEST/*_1.fastq.gz",
      "label": "fastq1",
      "type": "BaseInput",
      "rules": [
        {
          "required": true,
          "message": "This field cannot be empty!"
        }
      ]
    },
    {
      "name": [
        "content",
        "fastq2"
      ],
      "initialValue": "/data/wangyang/NGS_TEST/*_2.fastq.gz",
      "label": "fastq2",
      "type": "BaseInput",
      "rules": [
        {
          "required": true,
          "message": "This field cannot be empty!"
        }
      ]
    }
  ]
}