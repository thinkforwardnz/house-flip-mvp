
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, File, Image, Trash } from 'lucide-react';

interface UploadedFile {
  id: string;
  name: string;
  type: 'photo' | 'invoice' | 'document';
  size: string;
  uploadDate: string;
  url?: string;
}

const FileUpload = () => {
  const [files] = useState<UploadedFile[]>([
    {
      id: '1',
      name: 'kitchen_before.jpg',
      type: 'photo',
      size: '2.4 MB',
      uploadDate: '2024-02-08',
      url: 'https://images.unsplash.com/photo-1556912173-46c336c7fd55?auto=format&fit=crop&w=400&q=80'
    },
    {
      id: '2',
      name: 'electrical_invoice.pdf',
      type: 'invoice',
      size: '1.2 MB',
      uploadDate: '2024-02-07'
    },
    {
      id: '3',
      name: 'bathroom_progress.jpg',
      type: 'photo',
      size: '3.1 MB',
      uploadDate: '2024-02-06',
      url: 'https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&w=400&q=80'
    },
    {
      id: '4',
      name: 'materials_receipt.pdf',
      type: 'invoice',
      size: '856 KB',
      uploadDate: '2024-02-05'
    }
  ];

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'photo': return <Image className="h-5 w-5 text-blue-500" />;
      case 'invoice': return <File className="h-5 w-5 text-green-500" />;
      default: return <File className="h-5 w-5 text-gray-500" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'photo': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'invoice': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Upload Areas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="mx-auto w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Image className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload Photos</h3>
              <p className="text-sm text-gray-600 mb-4">
                Progress photos, before/after shots
              </p>
              <Button className="bg-[#1B5E20] hover:bg-[#1B5E20]/90 text-white">
                <Upload className="h-4 w-4 mr-2" />
                Choose Photos
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="mx-auto w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <File className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload Documents</h3>
              <p className="text-sm text-gray-600 mb-4">
                Invoices, receipts, permits
              </p>
              <Button className="bg-[#1B5E20] hover:bg-[#1B5E20]/90 text-white">
                <Upload className="h-4 w-4 mr-2" />
                Choose Files
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* File List */}
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Uploaded Files</h3>
            <span className="text-sm text-gray-500">{files.length} files</span>
          </div>

          <div className="space-y-3">
            {files.map((file) => (
              <div key={file.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex-shrink-0">
                  {file.url ? (
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-200">
                      <img 
                        src={file.url} 
                        alt={file.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                      {getFileIcon(file.type)}
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-gray-900 truncate">{file.name}</h4>
                    <span className={`px-2 py-1 text-xs font-medium rounded border ${getTypeColor(file.type)}`}>
                      {file.type}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>{file.size}</span>
                    <span>Uploaded {file.uploadDate}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="border-gray-300 text-gray-600">
                    View
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

export default FileUpload;
