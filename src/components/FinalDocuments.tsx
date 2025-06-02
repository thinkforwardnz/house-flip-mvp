
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Upload, FileText, Image, Download, Trash, Eye } from 'lucide-react';

interface Document {
  id: string;
  name: string;
  type: 'settlement' | 'photo' | 'invoice' | 'tax' | 'other';
  size: string;
  uploadDate: string;
  url?: string;
}

const FinalDocuments = () => {
  const [documents] = useState<Document[]>([
    {
      id: '1',
      name: 'settlement_statement_final.pdf',
      type: 'settlement',
      size: '2.1 MB',
      uploadDate: '2024-02-20',
    },
    {
      id: '2',
      name: 'after_renovation_photos.zip',
      type: 'photo',
      size: '15.3 MB',
      uploadDate: '2024-02-19',
    },
    {
      id: '3',
      name: 'final_invoices_summary.pdf',
      type: 'invoice',
      size: '1.8 MB',
      uploadDate: '2024-02-18',
    },
    {
      id: '4',
      name: 'gst_return_documents.pdf',
      type: 'tax',
      size: '945 KB',
      uploadDate: '2024-02-17',
    },
    {
      id: '5',
      name: 'agent_commission_receipt.pdf',
      type: 'invoice',
      size: '567 KB',
      uploadDate: '2024-02-16',
    }
  ]);

  const getDocumentIcon = (type: string) => {
    switch (type) {
      case 'photo':
        return <Image className="h-5 w-5 text-blue-500" />;
      case 'settlement':
        return <FileText className="h-5 w-5 text-[#1B5E20]" />;
      case 'invoice':
        return <FileText className="h-5 w-5 text-[#FF9800]" />;
      case 'tax':
        return <FileText className="h-5 w-5 text-red-500" />;
      default:
        return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  const getTypeBadge = (type: string) => {
    const badges = {
      settlement: 'bg-[#1B5E20]/10 text-[#1B5E20] border-[#1B5E20]/20',
      photo: 'bg-blue-100 text-blue-800 border-blue-200',
      invoice: 'bg-[#FF9800]/10 text-[#FF9800] border-[#FF9800]/20',
      tax: 'bg-red-100 text-red-800 border-red-200',
      other: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    
    return badges[type as keyof typeof badges] || badges.other;
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      settlement: 'Settlement',
      photo: 'Photo',
      invoice: 'Invoice',
      tax: 'Tax Doc',
      other: 'Other'
    };
    
    return labels[type as keyof typeof labels] || 'Other';
  };

  return (
    <Card className="bg-white border border-gray-200 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900">Final Documentation</CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Upload Areas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#1B5E20] transition-colors cursor-pointer">
            <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-900 mb-1">Settlement Docs</p>
            <p className="text-xs text-gray-500">Upload final statements</p>
          </div>
          
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#1B5E20] transition-colors cursor-pointer">
            <Image className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-900 mb-1">Final Photos</p>
            <p className="text-xs text-gray-500">Before/after gallery</p>
          </div>
          
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#1B5E20] transition-colors cursor-pointer">
            <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-900 mb-1">Other Docs</p>
            <p className="text-xs text-gray-500">Receipts, contracts</p>
          </div>
        </div>

        {/* Document List */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-gray-900">Uploaded Documents</h4>
            <Badge className="bg-gray-100 text-gray-800 border-gray-200">
              {documents.length} files
            </Badge>
          </div>

          <div className="space-y-3">
            {documents.map((doc) => (
              <div key={doc.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-gray-200">
                    {getDocumentIcon(doc.type)}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h5 className="font-medium text-gray-900 truncate">{doc.name}</h5>
                    <Badge className={getTypeBadge(doc.type)}>
                      {getTypeLabel(doc.type)}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>{doc.size}</span>
                    <span>Uploaded {doc.uploadDate}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="border-gray-300 text-gray-600">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" className="border-gray-300 text-gray-600">
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" className="border-red-300 text-red-600 hover:bg-red-50">
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bulk Actions */}
        <div className="pt-4 border-t border-gray-200">
          <div className="flex flex-wrap gap-3">
            <Button 
              variant="outline"
              className="border-[#1B5E20] text-[#1B5E20] hover:bg-[#1B5E20] hover:text-white"
            >
              <Download className="h-4 w-4 mr-2" />
              Download All
            </Button>
            <Button 
              variant="outline"
              className="border-gray-300 text-gray-600"
            >
              Create ZIP Archive
            </Button>
            <Button 
              className="bg-[#FF9800] hover:bg-[#FF9800]/90 text-white"
            >
              Generate Deal Report
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FinalDocuments;
