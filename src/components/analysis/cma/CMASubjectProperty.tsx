import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Home, MapPin, Ruler, RefreshCw, Car, Wifi, TrendingUp, Bed, Bath, Square } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Deal } from '@/types/analysis';
interface CMASubjectPropertyProps {
  deal: Deal;
  onDealUpdate?: (updatedDeal: Deal) => void;
}
const CMASubjectProperty = ({
  deal,
  onDealUpdate
}: CMASubjectPropertyProps) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isAssessing, setIsAssessing] = useState(false);
  const {
    toast
  } = useToast();
  const handleAnalyzeAndEnrich = async () => {
    setIsAnalyzing(true);
    try {
      console.log('Starting property analysis and enrichment for deal:', deal.id);

      // Get the property from the deal's property_id
      if (!deal.property_id) {
        toast({
          title: "No Property Found",
          description: "This deal is not linked to a property",
          variant: "destructive"
        });
        return;
      }

      // Call the property enrichment function
      const {
        data,
        error
      } = await supabase.functions.invoke('enrich-property-data', {
        body: {
          propertyId: deal.property_id,
          propertyData: {
            id: deal.property_id
          }
        }
      });
      if (error) {
        console.error('Property enrichment error:', error);
        throw error;
      }
      if (data.success) {
        toast({
          title: "Property Analyzed",
          description: "Property has been analyzed and enriched with detailed information and AI insights"
        });

        // Fetch the updated deal data
        const {
          data: updatedDealData,
          error: fetchError
        } = await supabase.from('deals').select(`
            *,
            unified_properties (
              address,
              suburb,
              city,
              bedrooms,
              bathrooms,
              floor_area,
              land_area,
              photos,
              description,
              coordinates
            )
          `).eq('id', deal.id).single();
        if (!fetchError && updatedDealData && onDealUpdate) {
          // Transform the Supabase data to match our Deal interface
          const property = updatedDealData.unified_properties;
          const transformedDeal: Deal = {
            ...updatedDealData,
            property: property ? {
              address: property.address,
              suburb: property.suburb || '',
              city: property.city || 'Auckland',
              bedrooms: property.bedrooms || undefined,
              bathrooms: property.bathrooms || undefined,
              floor_area: property.floor_area || undefined,
              land_area: property.land_area || undefined,
              photos: property.photos || undefined,
              description: property.description || undefined,
              coordinates: property.coordinates && typeof property.coordinates === 'object' && property.coordinates !== null && 'x' in property.coordinates && 'y' in property.coordinates ? {
                lat: (property.coordinates as any).y,
                lng: (property.coordinates as any).x
              } : undefined
            } : undefined,
            // Flatten for backward compatibility
            address: property?.address,
            suburb: property?.suburb || '',
            city: property?.city || 'Auckland',
            bedrooms: property?.bedrooms || undefined,
            bathrooms: property?.bathrooms || undefined,
            floor_area: property?.floor_area || undefined,
            land_area: property?.land_area || undefined,
            photos: property?.photos || undefined,
            description: property?.description || undefined,
            coordinates: property?.coordinates && typeof property.coordinates === 'object' && property.coordinates !== null && 'x' in property.coordinates && 'y' in property.coordinates ? {
              lat: (property.coordinates as any).y,
              lng: (property.coordinates as any).x
            } : undefined,
            market_analysis: updatedDealData.market_analysis && typeof updatedDealData.market_analysis === 'object' && updatedDealData.market_analysis !== null ? updatedDealData.market_analysis as any : undefined,
            renovation_analysis: updatedDealData.renovation_analysis && typeof updatedDealData.renovation_analysis === 'object' && updatedDealData.renovation_analysis !== null ? updatedDealData.renovation_analysis as any : undefined,
            risk_assessment: updatedDealData.risk_assessment && typeof updatedDealData.risk_assessment === 'object' && updatedDealData.risk_assessment !== null ? updatedDealData.risk_assessment as any : undefined,
            analysis_data: updatedDealData.analysis_data && typeof updatedDealData.analysis_data === 'object' && updatedDealData.analysis_data !== null ? updatedDealData.analysis_data as any : undefined,
            listing_details: updatedDealData.listing_details && typeof updatedDealData.listing_details === 'object' && updatedDealData.listing_details !== null ? updatedDealData.listing_details as any : undefined
          };
          onDealUpdate(transformedDeal);
        }
      } else {
        toast({
          title: "Analysis Incomplete",
          description: data.message || "Could not collect additional property data"
        });
      }
    } catch (error: any) {
      console.error('Error analyzing and enriching property:', error);
      toast({
        title: "Analysis Failed",
        description: error.message || "Failed to analyze and enrich property data",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Get listing details from the database
  const listingDetails = deal.listing_details || {};
  const condition = (deal.market_analysis as any)?.condition_assessment;
  return <div className="space-y-4 sm:space-y-6">
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <div className="flex items-center gap-3">
              <CardTitle className="text-navy-dark flex items-center gap-2">
                <Home className="h-5 w-5 flex-shrink-0" />
                <span className="break-words">{deal.address || 'Subject Property'}</span>
              </CardTitle>
              {condition?.overall_condition && <span className="text-xs px-2 py-1 rounded-md bg-gray-100 text-navy">
                  Condition: {condition.overall_condition.label} {condition.overall_condition.score !== undefined ? `(${Math.round(condition.overall_condition.score)}/100)` : ''}
                </span>}
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <Button onClick={handleAnalyzeAndEnrich} disabled={isAnalyzing} variant="outline" size="sm" className="rounded-xl flex-shrink-0 w-full sm:w-auto">
                <TrendingUp className={`h-4 w-4 mr-2 ${isAnalyzing ? 'animate-spin' : ''}`} />
                {isAnalyzing ? 'Analyzing...' : 'Analyze & Enrich'}
              </Button>
              <Button onClick={async () => {
              setIsAssessing(true);
              try {
                const {
                  data,
                  error
                } = await supabase.functions.invoke('condition-analysis', {
                  body: {
                    dealId: deal.id,
                    photos: deal.photos,
                    description: deal.description
                  }
                });
                if (error) throw error;
                if (data?.success) {
                  toast({
                    title: 'Condition Assessed',
                    description: 'AI vision completed successfully.'
                  });
                  // Fetch updated deal
                  const {
                    data: updatedDealData,
                    error: fetchError
                  } = await supabase.from('deals').select(`
                          *,
                          unified_properties (
                            address,
                            suburb,
                            city,
                            bedrooms,
                            bathrooms,
                            floor_area,
                            land_area,
                            photos,
                            description,
                            coordinates
                          )
                        `).eq('id', deal.id).single();
                  if (!fetchError && updatedDealData && onDealUpdate) {
                    const property = updatedDealData.unified_properties;
                    const transformedDeal: Deal = {
                      ...updatedDealData,
                      property: property ? {
                        address: property.address,
                        suburb: property.suburb || '',
                        city: property.city || 'Auckland',
                        bedrooms: property.bedrooms || undefined,
                        bathrooms: property.bathrooms || undefined,
                        floor_area: property.floor_area || undefined,
                        land_area: property.land_area || undefined,
                        photos: property.photos || undefined,
                        description: property.description || undefined,
                        coordinates: property.coordinates && typeof property.coordinates === 'object' && property.coordinates !== null && 'x' in property.coordinates && 'y' in property.coordinates ? {
                          lat: (property.coordinates as any).y,
                          lng: (property.coordinates as any).x
                        } : undefined
                      } : undefined,
                      // Flatten for backward compatibility
                      address: property?.address,
                      suburb: property?.suburb || '',
                      city: property?.city || 'Auckland',
                      bedrooms: property?.bedrooms || undefined,
                      bathrooms: property?.bathrooms || undefined,
                      floor_area: property?.floor_area || undefined,
                      land_area: property?.land_area || undefined,
                      photos: property?.photos || undefined,
                      description: property?.description || undefined,
                      coordinates: property?.coordinates && typeof property.coordinates === 'object' && property.coordinates !== null && 'x' in property.coordinates && 'y' in property.coordinates ? {
                        lat: (property.coordinates as any).y,
                        lng: (property.coordinates as any).x
                      } : undefined,
                      market_analysis: updatedDealData.market_analysis && typeof updatedDealData.market_analysis === 'object' && updatedDealData.market_analysis !== null ? updatedDealData.market_analysis as any : undefined,
                      renovation_analysis: updatedDealData.renovation_analysis && typeof updatedDealData.renovation_analysis === 'object' && updatedDealData.renovation_analysis !== null ? updatedDealData.renovation_analysis as any : undefined,
                      risk_assessment: updatedDealData.risk_assessment && typeof updatedDealData.risk_assessment === 'object' && updatedDealData.risk_assessment !== null ? updatedDealData.risk_assessment as any : undefined,
                      analysis_data: updatedDealData.analysis_data && typeof updatedDealData.analysis_data === 'object' && updatedDealData.analysis_data !== null ? updatedDealData.analysis_data as any : undefined,
                      listing_details: updatedDealData.listing_details && typeof updatedDealData.listing_details === 'object' && updatedDealData.listing_details !== null ? updatedDealData.listing_details as any : undefined
                    };
                    onDealUpdate(transformedDeal);
                  }
                } else {
                  toast({
                    title: 'Assessment Failed',
                    description: data?.message || 'Could not assess condition',
                    variant: 'destructive'
                  });
                }
              } catch (err: any) {
                console.error('Condition analysis error:', err);
                toast({
                  title: 'Assessment Error',
                  description: err.message || 'Unexpected error',
                  variant: 'destructive'
                });
              } finally {
                setIsAssessing(false);
              }
            }} disabled={isAssessing} variant="outline" size="sm" className="rounded-xl flex-shrink-0 w-full sm:w-auto">
                <RefreshCw className={`h-4 w-4 mr-2 ${isAssessing ? 'animate-spin' : ''}`} />
                {isAssessing ? 'Assessing...' : 'Assess Condition (AI)'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-3 sm:p-4 lg:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
            <div className="space-y-3">
              
              
              
              {listingDetails.title && <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-2">
                  <span className="font-medium text-navy-dark flex-shrink-0">Listing Title:</span>
                  <span className="text-navy break-words">{listingDetails.title}</span>
                </div>}
              
              {listingDetails.type && <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Home className="h-4 w-4 text-gray-600 flex-shrink-0" />
                    <span className="font-medium text-navy-dark">Property Type:</span>
                  </div>
                  <span className="text-navy leading-relaxed break-words">{listingDetails.type}</span>
                </div>}
              
              {!listingDetails.type && <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Home className="h-4 w-4 text-gray-600 flex-shrink-0" />
                    <span className="font-medium text-navy-dark">Property Type:</span>
                  </div>
                  <span className="text-navy leading-relaxed break-words">Residential House</span>
                </div>}

              {listingDetails.method && <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-navy-dark">Sale Method:</span>
                  </div>
                  <span className="text-navy leading-relaxed break-words">{listingDetails.method}</span>
                </div>}

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Ruler className="h-4 w-4 text-gray-600 flex-shrink-0" />
                  <span className="font-medium text-navy-dark">Floor Area:</span>
                </div>
                <span className="text-navy leading-relaxed break-words">{deal.floor_area ? `${deal.floor_area}m²` : 'TBD'}</span>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Square className="h-4 w-4 text-gray-600 flex-shrink-0" />
                  <span className="font-medium text-navy-dark">Land Area:</span>
                </div>
                <span className="text-navy leading-relaxed break-words">{deal.land_area ? `${deal.land_area}m²` : 'TBD'}</span>
              </div>
            </div>
            
            <div className="space-y-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Bed className="h-4 w-4 text-gray-600 flex-shrink-0" />
                  <span className="font-medium text-navy-dark">Bedrooms:</span>
                </div>
                <span className="text-navy leading-relaxed break-words">{deal.bedrooms || 'TBD'}</span>
              </div>
              
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Bath className="h-4 w-4 text-gray-600 flex-shrink-0" />
                  <span className="font-medium text-navy-dark">Bathrooms:</span>
                </div>
                <span className="text-navy leading-relaxed break-words">{deal.bathrooms || 'TBD'}</span>
              </div>

              {listingDetails.parking && <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-2">
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Car className="h-4 w-4 text-gray-600" />
                    <span className="font-medium text-navy-dark">Parking:</span>
                  </div>
                  <span className="text-navy pl-6 sm:pl-0 break-words">{listingDetails.parking}</span>
                </div>}

              {listingDetails.internet && <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-2">
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Wifi className="h-4 w-4 text-gray-600" />
                    <span className="font-medium text-navy-dark">Internet:</span>
                  </div>
                  <span className="text-navy pl-6 sm:pl-0 break-words">{listingDetails.internet}</span>
                </div>}

              {listingDetails.date && <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-2">
                  <span className="font-medium text-navy-dark flex-shrink-0">Listed:</span>
                  <span className="text-navy break-words">{listingDetails.date}</span>
                </div>}
            </div>
          </div>

          {listingDetails.other_features && <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="space-y-2">
                <span className="font-medium text-navy-dark">Additional Features:</span>
                <p className="text-navy text-sm break-words">{listingDetails.other_features}</p>
              </div>
            </div>}
        </CardContent>
      </Card>

      {/* Property Photos */}
      {deal.photos && deal.photos.length > 0 && <Card>
          <CardHeader>
            <CardTitle className="text-navy-dark">Property Photos</CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 lg:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {deal.photos.slice(0, 6).map((photo, index) => <div key={index} className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                  <img src={photo} alt={`Property photo ${index + 1}`} className="w-full h-full object-cover" onError={e => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }} />
                </div>)}
            </div>
            {deal.photos.length > 6 && <p className="text-sm text-gray-500 mt-2">
                Showing 6 of {deal.photos.length} photos
              </p>}
          </CardContent>
        </Card>}
    </div>;
};
export default CMASubjectProperty;