
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
  "name": "丰度矩阵",
  "script_type": "python",
  "image": "registry.cn-hangzhou.aliyuncs.com/wybioinfo/datascience-notebook:x86_64-ubuntu-22.04",
  "sampleGroupJSON": true,
  "saveAnalysisMethod": "metaphlan_sam_abundance_matrix",
  "moduleName": "abundance_matrix",
  "formJson": [
    {
      "name": "group_field",
      "label": "分组列",
      "rules": [
        {
          "required": true,
          "message": "该字段不能为空!"
        }
      ],
      "type": "GroupFieldSelect"
    },
    {
      "name": "metaphlan_sam_abundance",
      "label": "丰度文件",
      "rules": [
        {
          "required": true,
          "message": "该字段不能为空!"
        }
      ],
      "type": "GroupSelectSampleButton",
      "group": "group_field"
    }
  ],
  "tableDesc": ""
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