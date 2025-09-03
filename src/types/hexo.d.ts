declare module 'hexo' {
  import Model from 'warehouse/dist/model'

  interface RssProperties {
    input: string
    output: string
  }

  interface Config {
    title: string;
    subtitle: string;
    description: string;
    author: string;
    language: string;
    timezone: string;
    url: string;
    root: string;
    permalink: string;
    permalink_defaults: {
      lang?: string
      language?: string
    };
    pretty_urls: {
      trailing_index: boolean;
      trailing_html: boolean;
    };
    source_dir: string;
    public_dir: string;
    tag_dir: string;
    archive_dir: string;
    category_dir: string;
    code_dir: string;
    i18n_dir: string;
    skip_render: any[];
    new_post_name: string;
    default_layout: string;
    titlecase: boolean;
    external_link: {
      enable: boolean;
      field: string;
      exclude: string;
    };
    filename_case: number;
    render_drafts: boolean;
    post_asset_folder: boolean;
    relative_link: boolean;
    future: boolean;
    syntax_highlighter: string;
    highlight: {
      auto_detect: boolean;
      line_number: boolean;
      tab_replace: string;
      wrap: boolean;
      exclude_languages: any[];
      language_attr: boolean;
      hljs: boolean;
      line_threshold: number;
      first_line_number: string;
      strip_indent: boolean;
    };
    prismjs: {
      preprocess: boolean;
      line_number: boolean;
      tab_replace: string;
      exclude_languages: any[];
      strip_indent: boolean;
    };
    default_category: string;
    category_map: {};
    tag_map: {};
    date_format: string;
    time_format: string;
    updated_option: string;
    per_page: number;
    pagination_dir: string;
    theme: string;
    server: {
      cache: boolean;
    };
    deploy: {};
    ignore: any[];
    meta_generator: boolean;
    feed: {
      autodiscovery?: boolean
      icon: string
      title: string
      limit?: number
      order_by?: string
      types: Record<string, RssProperties>
    },
    email?: string
  }

  interface PostData {
    title: string
    date: Date
    layout: string
    comments: boolean
    layout: string
    content: string
    source: string
    slug: string
    photos?: string[]
    raw: string
    published: boolean
    excerpt?: string
    more?: string
    slug?: string | number
    [prop: string]: any
  }

  interface BaseObj {
      path: string;
      data?: any;
      layout?: string | string[];
  }

  interface PageData {
    title: string
    date: Date
    updated: Date
    comments: boolean
    layout: string
    content: string
    source: string
    path: string
    raw: string
    excerpt?: string
    more?: string
    posts: PostData[]
  }

  export interface Page extends PageData {
    script_snippets: string[]
  }

  export class Locals {
    cache: any;
    getters: any;
    constructor();
    get(name: 'posts'): Model<PostData>
    get(name: string): any;
    set(name: string, value: any): this;
    remove(name: string): this;
    invalidate(): this;
    toObject(): {
      posts: Model<PostData>
    };
  }

  type GeneratorReturnType = BaseObj | BaseObj[] | undefined;
  export type GeneratorFunction = (locals: ReturnType<Locals['toObject']>, callback?: NodeJSLikeCallback<any>) => GeneratorReturnType | Promise<GeneratorReturnType>;

  interface StoreFunction {
      (...locals: any[]): Promise<any> | any
  }
  interface Store {
      [key: string]: StoreFunction;
  }

  class Generator {
    id: number;
    store: Store;
    constructor();
    list(): Store;
    get(name: string): StoreFunction;
    register(fn: GeneratorFunction): void;
    register(name: string, fn: GeneratorFunction): void;
  }

  class Helper {
    store: Store
    constructor()
    list(): Store
    get(name: string): StoreFunction
    register(name: string, fn: StoreFunction): void
  }
  
  interface Extend {
    console: Console;
    deployer: Deployer;
    filter: Filter;
    generator: Generator;
    helper: Helper;
    highlight: Highlight;
    injector: Injector;
    migrator: Migrator;
    processor: Processor;
    renderer: Renderer;
    tag: Tag;
  }

  export default class Hexo extends Extensions {
    config: Config
    extend: Extend

    url_for(path: string, options = {}): string
    js_ex(base: string, relative: string, ex = '')
    page: PageDPageata
  }
}
