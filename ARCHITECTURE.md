# GolfGo Coach Portal - Architecture & Stack Documentation

## Tech Stack Overview

```mermaid
graph TB
    subgraph frontend[Frontend Layer]
        React[React 18.2]
        TypeScript[TypeScript 5.3]
        Vite[Vite 5.0]
        Tailwind[Tailwind CSS 3.4]
        Router[React Router 6.20]
    end
    
    subgraph state[State Management]
        Zustand[Zustand 4.4]
    end
    
    subgraph ui[UI Libraries]
        Recharts[Recharts 2.10]
    end
    
    subgraph build[Build Tools]
        ESLint[ESLint 9.39]
        PostCSS[PostCSS 8.4]
        Autoprefixer[Autoprefixer 10.4]
    end
    
    subgraph deployment[Deployment]
        Vercel[Vercel]
        Netlify[Netlify]
    end
    
    frontend --> state
    frontend --> ui
    build --> frontend
    frontend --> deployment
```

## Application Architecture

```mermaid
graph TB
    subgraph browser[Browser]
        subgraph app[React Application]
            App[App.tsx<br/>Router & Layout]
            
            subgraph pages[Pages]
                StrategyApproval[StrategyApproval]
                PlayerDetail[PlayerDetail]
                RoundDefense[RoundDefense]
                Tournaments[Tournaments]
                CreateStrategy[CreateStrategy]
                Dashboard[Dashboard]
                Settings[Settings]
                FAQ[FAQ]
            end
            
            subgraph components[Components]
                Shared[Shared Components]
                Player[Player Components]
                Strategy[Strategy Components]
                RoundDefenseComps[Round Defense Components]
                DashboardComps[Dashboard Components]
                ClippD[ClippD Components]
            end
            
            subgraph state[State Management]
                ZustandStore[Zustand Store<br/>roundDefenseStore]
            end
            
            subgraph hooks[Custom Hooks]
                usePlayerData[usePlayerData]
                usePlayerStats[usePlayerStats]
                useRoundData[useRoundData]
            end
            
            subgraph utils[Utilities]
                StatsCalc[statsCalculations]
                PlayerTendencies[playerTendencies]
                StrategyEngine[strategyEngine]
                ClippDMapping[clippDMapping]
            end
            
            subgraph data[Static Data]
                PlayersJSON[players.json]
                RoundsJSON[player_*_rounds.json]
                CourseJSON[course.json]
            end
        end
    end
    
    App --> pages
    pages --> components
    components --> hooks
    components --> utils
    components --> ZustandStore
    hooks --> data
    utils --> data
```

## Component Hierarchy

```mermaid
graph TD
    App[App.tsx] --> Navigation[Navigation]
    App --> Router[React Router]
    
    Router --> StrategyApproval[StrategyApproval Page]
    Router --> PlayerDetail[PlayerDetail Page]
    Router --> RoundDefense[RoundDefense Page]
    Router --> Tournaments[Tournaments Page]
    Router --> CreateStrategy[CreateStrategy Page]
    Router --> Dashboard[Dashboard Page]
    Router --> Settings[Settings Page]
    Router --> FAQ[FAQ Page]
    
    StrategyApproval --> ApprovalInterface
    StrategyApproval --> StrategyCard
    StrategyApproval --> PlayerSelector
    
    PlayerDetail --> Player360Panel
    PlayerDetail --> TabNavigation
    Player360Panel --> ScoreCard
    Player360Panel --> OffTheTeeStats
    Player360Panel --> ApproachStats
    Player360Panel --> ShortGameStats
    Player360Panel --> PuttingStats
    Player360Panel --> StrokesGainedBreakdown
    
    RoundDefense --> PlayerRoundDefense
    PlayerRoundDefense --> ScoreCard
    PlayerRoundDefense --> RoundStats
    PlayerRoundDefense --> HoleAudioClips
    PlayerRoundDefense --> PressConference
    HoleAudioClips --> VoiceRecorder
    PressConference --> VoiceRecorder
    
    Dashboard --> PlayerCard
    Dashboard --> StatCard
    Dashboard --> PerformanceChart
    Dashboard --> StrokesGainedChart
    
    Tournaments --> CustomStrategyBuilder
```

## Data Flow Architecture

```mermaid
sequenceDiagram
    participant User
    participant Component
    participant Hook
    participant Store
    participant Data
    
    User->>Component: User Interaction
    Component->>Hook: usePlayerData() / useRoundData()
    Hook->>Data: Import JSON Data
    Data-->>Hook: Player/Round Data
    Hook-->>Component: Processed Data
    
    Component->>Store: Update State (Zustand)
    Store-->>Component: State Update
    Component-->>User: UI Update
    
    Note over Component,Store: Audio recordings stored<br/>in Zustand (session-based)
```

## Feature Modules

```mermaid
graph LR
    subgraph strategy[Strategy Module]
        S1[Strategy Approval]
        S2[Create Strategy]
        S3[Strategy Engine]
        S4[Voice Recorder]
    end
    
    subgraph player[Player Analysis]
        P1[Player 360 View]
        P2[Round Statistics]
        P3[Progression Charts]
        P4[Strokes Gained]
    end
    
    subgraph defense[Round Defense]
        D1[Hole Audio Clips]
        D2[Press Conference]
        D3[Round Stats]
        D4[Scorecard]
    end
    
    subgraph dashboard[Dashboard]
        DA1[Player Cards]
        DA2[Performance Charts]
        DA3[Group Analytics]
    end
    
    subgraph clippd[ClippD Integration]
        C1[Sync Status]
        C2[Metric Cards]
        C3[Category Sections]
    end
```

## Technology Stack Details

### Frontend Framework
- **React 18.2** - UI library with hooks and functional components
- **TypeScript 5.3** - Type-safe JavaScript
- **Vite 5.0** - Fast build tool and dev server

### Routing
- **React Router 6.20** - Client-side routing

### Styling
- **Tailwind CSS 3.4** - Utility-first CSS framework
- **PostCSS 8.4** - CSS processing
- **Autoprefixer 10.4** - Automatic vendor prefixes

### State Management
- **Zustand 4.4** - Lightweight state management (used for Round Defense audio storage)

### Data Visualization
- **Recharts 2.10** - Chart library for React

### Development Tools
- **ESLint 9.39** - Code linting
- **TypeScript ESLint** - TypeScript-specific linting rules

### Deployment
- **Vercel** - Primary deployment platform (configured)
- **Netlify** - Alternative deployment platform (configured)

## File Structure

```
src/
├── components/          # Reusable UI components
│   ├── clippd/         # ClippD integration components
│   ├── dashboard/      # Dashboard widgets
│   ├── player/         # Player analysis components
│   ├── round-defense/  # Round Defense feature
│   ├── shared/         # Shared components (Logo, Navigation)
│   └── strategy/       # Strategy-related components
├── pages/              # Page-level components (routes)
├── hooks/              # Custom React hooks
├── stores/             # Zustand state stores
├── utils/               # Utility functions
├── types/               # TypeScript type definitions
├── data/                # Static JSON data files
└── assets/             # Static assets (images, etc.)
```

## Data Architecture

### Static Data Storage
- **JSON Files** - All player and round data stored as static JSON files
- **Import Strategy** - Using Vite's `import.meta.glob` for dynamic imports

### State Management
- **Zustand Store** - Session-based storage for audio recordings
- **React State** - Component-level state for UI interactions
- **Custom Hooks** - Data fetching and processing logic

## Build & Deployment Flow

```mermaid
graph LR
    Source[Source Code] --> Build[Vite Build]
    Build --> TypeCheck[TypeScript Compilation]
    TypeCheck --> Bundle[Bundle Assets]
    Bundle --> Dist[dist/ folder]
    Dist --> Deploy[Deploy to Vercel/Netlify]
    Deploy --> CDN[CDN Distribution]
    CDN --> Users[End Users]
```

## Key Design Patterns

1. **Component Composition** - Small, reusable components
2. **Custom Hooks** - Data fetching and business logic separation
3. **Type Safety** - Comprehensive TypeScript types
4. **Utility Functions** - Pure functions for calculations
5. **Session State** - Zustand for temporary data (audio recordings)

## Performance Considerations

- **Code Splitting** - Vite handles automatic code splitting
- **Static Assets** - Optimized through Vite's build process
- **Lazy Loading** - React Router supports lazy loading (can be added)
- **Bundle Size** - Current bundle ~970KB (consider code splitting for production)

## Future Enhancements

1. **Backend API** - Replace static JSON with API endpoints
2. **Database** - Persistent storage for players, rounds, and audio
3. **Authentication** - User login and authorization
4. **Real-time Updates** - WebSocket for live data
5. **File Storage** - Cloud storage for audio recordings (S3, etc.)
