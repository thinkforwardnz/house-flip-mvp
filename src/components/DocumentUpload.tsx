
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, FileText, Eye, Download, Trash } from 'lucide-react';

interface Document {
  id: string;
  name: string;
  type: 'spa' | 'contract' | 'other';
  size: string;
  uploadDate: string;
  autoFilled?: boolean;
}

const DocumentUpload = () => {
  const [documents] = useState<Document[]>([
    {
      id: '1',
      name: 'Sale_Purchase_Agreement_v1.pdf',
      type: 'spa',
      size: '2.1 MB',
      uploadDate: '2024-02-10',
      autoFilled: true
    },
    {
      id: '2',
      name: 'Property_Disclosure_Statement.pdf',
      type: 'other',
      size: '856 KB',
      uploadDate: '2024-02-08'
    }
  ]);

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'spa': return 'Sale & Purchase Agreement';
      case 'contract': return 'Contract';
      default: return 'Document';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'spa': return 'bg-[#1B5E20]/10 text-[#1B5E20] border-[#1B5E20]/20';
      case 'contract': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Upload Area */}
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Upload className="h-5 w-5 text-[#1B5E20]" />
            Upload Documents
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-[#1B5E20] transition-colors">
            <div className="mx-auto w-12 h-12 bg-[#1B5E20]/10 rounded-lg flex items-center justify-center mb-4">
              <FileText className="h-6 w-6 text-[#1B5E20]" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Upload Sale & Purchase Agreement
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Drop your S&P agreement here or click to browse. We'll auto-fill offer details where possible.
            </p>
            <Button className="bg-[#1B5E20] hover:bg-[#1B5E20]/90 text-white">
              <Upload className="h-4 w-4 mr-2" />
              Choose File
            </Button>
            <p className="text-xs text-gray-500 mt-2">
              Supports PDF, DOC, DOCX files up to 10MB
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Auto-fill Notice */}
      <Card className="bg-[#388E3C]/5 border border-[#388E3C]/20">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 bg-[#388E3C] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-white text-xs font-bold">✓</span>
            </div>
            <div>
              <h4 className="font-medium text-[#388E3C] mb-1">Smart Auto-fill Enabled</h4>
              <p className="text-sm text-gray-700">
                When you upload a Sale & Purchase Agreement, we'll automatically extract key details like property address, 
                price, and conditions to pre-fill your offer forms.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Documents List */}
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-gray-900 flex items-center justify-between">
            <span>Uploaded Documents</span>
            <span className="text-sm text-gray-500 font-normal">{documents.length} files</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {documents.map((doc) => (
              <div key={doc.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <FileText className="h-6 w-6 text-red-600" />
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-gray-900 truncate">{doc.name}</h4>
                    <span className={`px-2 py-1 text-xs font-medium rounded border ${getTypeColor(doc.type)}`}>
                      {getTypeLabel(doc.type)}
                    </span>
                    {doc.autoFilled && (
                      <span className="px-2 py-1 text-xs font-medium rounded bg-[#388E3C]/10 text-[#388E3C] border border-[#388E3C]/20">
                        Auto-filled
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>{doc.size}</span>
                    <span>Uploaded {new Date(doc.uploadDate).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="border-gray-300 text-gray-600">
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  <Button variant="outline" size="sm" className="border-gray-300 text-gray-600">
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </Button>
                  <Button variant="outline" size="sm" className="border-red-300 text-red-600 hover:bg-red-50">
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DocumentUpload;
