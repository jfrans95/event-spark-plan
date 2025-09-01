import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface Database {
  public: {
    Tables: {
      profiles: {
        Insert: {
          user_id: string
          email: string
          full_name?: string
          role: 'administrator' | 'advisor' | 'collaborator' | 'provider'
        }
      }
      provider_applications: {
        Insert: {
          user_id: string
          company_name: string
          nit: string
          contact_name?: string
          contact_last_name?: string
          contact_email?: string
          contact_phone: string
          product_category: string
          years_experience: number
          experience_description: string
          specialization: string
          status: string
          reviewed_at?: string
        }
      }
      provider_profiles: {
        Insert: {
          user_id: string
          application_id: string
        }
      }
      products: {
        Insert: {
          provider_id: string
          name: string
          description?: string
          price: number
          categoria: 'montaje_tecnico' | 'decoracion_ambientacion' | 'catering' | 'mixologia_cocteleria' | 'arte_cultura' | 'audiovisuales' | 'mobiliario'
          space_types?: string[]
          capacity_min: number
          capacity_max: number
          event_types?: string[]
          plan: 'basico' | 'pro' | 'premium'
          activo: boolean
        }
      }
    }
  }
}

const demoData = {
  // Space types grouped
  spaceTypes: [
    'parques_publicos', 'jardines_botanicos', 'miradores_naturales', 'playas', 'plazoletas', 'calles_barrios',
    'salones_eventos', 'teatros', 'auditorios', 'centros_convenciones', 'discotecas', 'restaurantes_privados', 'iglesias_templos', 'galerias_museos',
    'bodegas', 'casas_patrimoniales', 'rooftops', 'locales_en_desuso', 'estudios', 'fincas_privadas',
    'casas_familiares', 'unidades_residenciales', 'casas_patio_jardin', 'viviendas_adecuadas',
    'carpas', 'contenedores'
  ],
  // Event types grouped
  eventTypes: [
    'celebraciones_internas', 'activaciones_marca', 'team_building', 'cierre_ano',
    'cumpleanos', 'dia_madre_padre', 'fechas_religiosas', 'graduaciones', 'reuniones_especiales',
    'eventos_pequenos', 'eventos_medios', 'eventos_institucionales', 'encuentros_publicos', 'lanzamientos_aniversarios'
  ],
  // Plans
  plans: ['basico', 'pro', 'premium'] as const,
  // Categories with provider info
  categories: [
    {
      key: 'montaje_tecnico' as const,
      name: 'Montaje técnico',
      providers: [
        { company: 'Montaje Pro 1', contact: 'Juan Pérez' },
        { company: 'Montaje Pro 2', contact: 'María González' },
        { company: 'Montaje Pro 3', contact: 'Carlos López' }
      ]
    },
    {
      key: 'decoracion_ambientacion' as const,
      name: 'Decoración/ambientación',
      providers: [
        { company: 'Decoración Elite 1', contact: 'Ana Martín' },
        { company: 'Decoración Elite 2', contact: 'Luis Rodríguez' },
        { company: 'Decoración Elite 3', contact: 'Carmen Díaz' }
      ]
    },
    {
      key: 'catering' as const,
      name: 'Catering',
      providers: [
        { company: 'Catering Gourmet 1', contact: 'Pedro Sánchez' },
        { company: 'Catering Gourmet 2', contact: 'Laura Jiménez' },
        { company: 'Catering Gourmet 3', contact: 'Antonio Ruiz' }
      ]
    },
    {
      key: 'mixologia_cocteleria' as const,
      name: 'Mixología/coctelería',
      providers: [
        { company: 'Cocktails Pro 1', contact: 'Sofia Hernández' },
        { company: 'Cocktails Pro 2', contact: 'Miguel Torres' },
        { company: 'Cocktails Pro 3', contact: 'Elena Morales' }
      ]
    },
    {
      key: 'arte_cultura' as const,
      name: 'Arte/cultura',
      providers: [
        { company: 'Arte Cultural 1', contact: 'Ricardo Vega' },
        { company: 'Arte Cultural 2', contact: 'Natalia Castro' },
        { company: 'Arte Cultural 3', contact: 'Fernando Gil' }
      ]
    },
    {
      key: 'audiovisuales' as const,
      name: 'Audiovisuales',
      providers: [
        { company: 'AV Solutions 1', contact: 'Andrea Ramírez' },
        { company: 'AV Solutions 2', contact: 'Jorge Mendoza' },
        { company: 'AV Solutions 3', contact: 'Carla Vargas' }
      ]
    },
    {
      key: 'mobiliario' as const,
      name: 'Mobiliario',
      providers: [
        { company: 'Mobiliario Elite 1', contact: 'Gabriel Ortega' },
        { company: 'Mobiliario Elite 2', contact: 'Isabella Cruz' },
        { company: 'Mobiliario Elite 3', contact: 'Sebastián Rojas' }
      ]
    }
  ]
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient<Database>(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    console.log('Starting demo seed creation...')

    // Clear existing seed data
    const { error: clearProductsError } = await supabase
      .from('products')
      .delete()
      .in('provider_id', 
        (await supabase.from('provider_profiles').select('id').in('user_id',
          (await supabase.from('profiles').select('user_id').ilike('email', '%seed%')).data?.map(p => p.user_id) || []
        )).data?.map(p => p.id) || []
      )

    const { error: clearProfilesError } = await supabase
      .from('provider_profiles')
      .delete()
      .in('user_id', 
        (await supabase.from('profiles').select('user_id').ilike('email', '%seed%')).data?.map(p => p.user_id) || []
      )

    const { error: clearAppsError } = await supabase
      .from('provider_applications')
      .delete()
      .in('user_id',
        (await supabase.from('profiles').select('user_id').ilike('email', '%seed%')).data?.map(p => p.user_id) || []
      )

    const { error: clearUsersError } = await supabase
      .from('profiles')
      .delete()
      .ilike('email', '%seed%')

    console.log('Cleared existing seed data')

    // Create seed data for each category
    const allProviders: any[] = []
    const allApplications: any[] = []
    let providerCounter = 1

    for (const category of demoData.categories) {
      for (const [index, provider] of category.providers.entries()) {
        const userId = crypto.randomUUID()
        const email = `${category.key}${index + 1}@seed.test`
        
        // Create profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .insert({
            user_id: userId,
            email: email,
            full_name: `${provider.contact} (${category.name})`,
            role: 'provider'
          })
          .select()
          .single()

        if (profileError) {
          console.error('Error creating profile:', profileError)
          continue
        }

        // Create application
        const { data: appData, error: appError } = await supabase
          .from('provider_applications')
          .insert({
            user_id: userId,
            company_name: provider.company,
            nit: `900${String(providerCounter).padStart(6, '0')}-${index + 1}`,
            contact_name: provider.contact.split(' ')[0],
            contact_last_name: provider.contact.split(' ')[1] || '',
            contact_email: email,
            contact_phone: `300${String(providerCounter + index).padStart(7, '0')}`,
            product_category: category.key,
            years_experience: Math.floor(Math.random() * 10) + 3,
            experience_description: `Especialistas en ${category.name.toLowerCase()} con amplia experiencia`,
            specialization: `${category.name} especializada`,
            status: 'approved',
            reviewed_at: new Date().toISOString()
          })
          .select()
          .single()

        if (appError) {
          console.error('Error creating application:', appError)
          continue
        }

        // Create provider profile
        const { data: providerProfileData, error: providerProfileError } = await supabase
          .from('provider_profiles')
          .insert({
            user_id: userId,
            application_id: appData.id
          })
          .select()
          .single()

        if (providerProfileError) {
          console.error('Error creating provider profile:', providerProfileError)
          continue
        }

        // Create 3 products per provider with varied attributes
        for (let productIndex = 0; productIndex < 3; productIndex++) {
          const capacityRanges = [
            { min: 20, max: 100 },   // Small events
            { min: 120, max: 300 },  // Medium events  
            { min: 300, max: 500 }   // Large events
          ]
          
          const capacity = capacityRanges[productIndex % 3]
          const planOptions = demoData.plans
          const plan = planOptions[productIndex % planOptions.length]
          
          // Select random space types and event types
          const selectedSpaces = demoData.spaceTypes
            .sort(() => 0.5 - Math.random())
            .slice(0, Math.floor(Math.random() * 4) + 2) // 2-5 space types
          
          const selectedEvents = demoData.eventTypes
            .sort(() => 0.5 - Math.random())
            .slice(0, Math.floor(Math.random() * 3) + 2) // 2-4 event types

          const basePrice = {
            basico: 100000,
            pro: 250000,
            premium: 500000
          }[plan]

          const { error: productError } = await supabase
            .from('products')
            .insert({
              provider_id: providerProfileData.id,
              name: `${category.name} ${['Básico', 'Profesional', 'Premium'][productIndex]}`,
              description: `Servicio de ${category.name.toLowerCase()} de alta calidad para eventos de ${capacity.min}-${capacity.max} personas`,
              price: basePrice + Math.floor(Math.random() * 200000),
              categoria: category.key,
              space_types: selectedSpaces,
              capacity_min: capacity.min,
              capacity_max: capacity.max,
              event_types: selectedEvents,
              plan: plan,
              activo: true
            })

          if (productError) {
            console.error('Error creating product:', productError)
          }
        }

        providerCounter++
      }
    }

    console.log('Demo seed data created successfully!')

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Demo seed data created successfully',
        providers_created: providerCounter - 1,
        products_created: (providerCounter - 1) * 3
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})